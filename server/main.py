"""
Face detection backend for Anonymizer.
Uses OpenCV YuNet (FaceDetectorYN) as primary detector.
Falls back to Haar cascades if YuNet model is not available.

Run:
    cd server && uvicorn main:app --port 7865 --reload
or:
    python3 main.py
"""

from __future__ import annotations

import importlib
import io
import json
import logging
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from typing import Any

import threading

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

# ── Safety limits ─────────────────────────────────────────────────────────────

MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB max upload
MAX_IMAGE_PIXELS = 30_000_000        # ~30 MP max decoded image (e.g. 6000x5000)
ALLOWED_MIME_PREFIXES = ("image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff")
IMAGE_MAGIC_BYTES = [
    (b"\xff\xd8\xff", "JPEG"),       # JPEG SOI
    (b"\x89PNG\r\n", "PNG"),         # PNG signature
    (b"RIFF", "WebP/RIFF"),          # WebP container
    (b"BM", "BMP"),
    (b"II\x2a\x00", "TIFF LE"),
    (b"MM\x00\x2a", "TIFF BE"),
]

# ── Paths ────────────────────────────────────────────────────────────────────

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

YUNET_MODEL_PATH = MODELS_DIR / "face_detection_yunet_2023mar.onnx"
YUNET_MODEL_URL = (
    "https://github.com/opencv/opencv_zoo/raw/main/models/"
    "face_detection_yunet/face_detection_yunet_2023mar.onnx"
)

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="Anonymizer Face Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Detector state ────────────────────────────────────────────────────────────

_yunet: cv2.FaceDetectorYN | None = None
_haar: cv2.CascadeClassifier | None = None
_detector_mode: str = "none"
_haar_lock = threading.Lock()  # Haar classifier is not thread-safe


def _download_yunet() -> bool:
    """Download YuNet ONNX model if not present. Returns True on success."""
    if YUNET_MODEL_PATH.exists():
        return True
    log.info("Downloading YuNet model from OpenCV Zoo…")
    try:
        urllib.request.urlretrieve(YUNET_MODEL_URL, YUNET_MODEL_PATH)
        log.info("YuNet model downloaded to %s", YUNET_MODEL_PATH)
        return True
    except Exception as exc:
        log.warning("Could not download YuNet model: %s", exc)
        return False


def _init_yunet(width: int = 640, height: int = 640) -> cv2.FaceDetectorYN | None:
    if not YUNET_MODEL_PATH.exists():
        return None
    try:
        det = cv2.FaceDetectorYN.create(
            str(YUNET_MODEL_PATH),
            "",
            (width, height),
            score_threshold=0.60,
            nms_threshold=0.30,
            top_k=5000,
        )
        return det
    except Exception as exc:
        log.warning("YuNet init failed: %s", exc)
        return None


def _init_haar() -> cv2.CascadeClassifier | None:
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    try:
        clf = cv2.CascadeClassifier(cascade_path)
        if clf.empty():
            return None
        return clf
    except Exception as exc:
        log.warning("Haar init failed: %s", exc)
        return None


def _startup_init() -> None:
    global _yunet, _haar, _detector_mode
    yunet_ok = _download_yunet()
    if yunet_ok:
        _yunet = _init_yunet()
        if _yunet:
            _detector_mode = "yunet"
            log.info("Primary detector: YuNet (OpenCV FaceDetectorYN)")
            return
    _haar = _init_haar()
    if _haar:
        _detector_mode = "haar"
        log.info("Primary detector: Haar cascades (fallback — YuNet unavailable)")
    else:
        _detector_mode = "none"
        log.warning("No face detector available!")


@app.on_event("startup")
def startup_event() -> None:
    _startup_init()


# ── Helpers ───────────────────────────────────────────────────────────────────


def _decode_image(data: bytes) -> np.ndarray:
    """Decode uploaded image bytes to BGR numpy array."""
    arr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image")
    return img


def _detect_yunet(img_bgr: np.ndarray, score_threshold: float = 0.60, robust: bool = False) -> list[dict]:
    """Detect faces with YuNet. Returns list of box dicts."""
    global _yunet
    h, w = img_bgr.shape[:2]

    # Re-create detector for this image size
    score_thr = 0.40 if robust else score_threshold
    det = cv2.FaceDetectorYN.create(
        str(YUNET_MODEL_PATH),
        "",
        (w, h),
        score_threshold=score_thr,
        nms_threshold=0.30,
        top_k=5000,
    )

    _faces_count, faces = det.detect(img_bgr)
    if faces is None:
        return []

    results = []
    for face in faces:
        x, y, bw, bh = face[:4]
        score = float(face[14]) if len(face) > 14 else float(face[4]) if len(face) > 4 else 1.0
        # Clamp to image bounds
        x = max(0, int(x))
        y = max(0, int(y))
        bw = min(int(bw), w - x)
        bh = min(int(bh), h - y)
        if bw < 5 or bh < 5:
            continue
        results.append({
            "x": x,
            "y": y,
            "width": bw,
            "height": bh,
            "score": round(score, 3),
            "source": "yunet",
        })
    return results


def _detect_haar(img_bgr: np.ndarray, robust: bool = False) -> list[dict]:
    """Detect faces with Haar cascades. Returns list of box dicts."""
    if _haar is None:
        return []
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    scale = 1.05 if robust else 1.1
    min_neighbors = 3 if robust else 5

    faces = _haar.detectMultiScale(
        gray,
        scaleFactor=scale,
        minNeighbors=min_neighbors,
        minSize=(30, 30),
        flags=cv2.CASCADE_SCALE_IMAGE,
    )

    results = []
    if len(faces) == 0:
        return results
    for x, y, bw, bh in faces:
        results.append({
            "x": int(x),
            "y": int(y),
            "width": int(bw),
            "height": int(bh),
            "score": 1.0,
            "source": "haar",
        })
    return results


# ── Routes ────────────────────────────────────────────────────────────────────


@app.get("/api/status")
def get_status() -> dict:
    """Health check and detector info."""
    return {
        "ok": True,
        "detector": _detector_mode,
        "yunet_model_present": YUNET_MODEL_PATH.exists(),
        "message": {
            "yunet": "YuNet (OpenCV FaceDetectorYN) — high accuracy",
            "haar": "Haar Cascades (fallback) — moderate accuracy",
            "none": "No detector available — check server logs",
        }.get(_detector_mode, "Unknown"),
    }


@app.get("/api/deps")
def get_deps() -> dict:
    """Check which backend dependencies are importable and whether the ONNX model exists."""
    REQUIRED: list[dict] = [
        {"pkg": "fastapi",    "import_name": "fastapi",    "label": "FastAPI"},
        {"pkg": "uvicorn",    "import_name": "uvicorn",    "label": "Uvicorn"},
        {"pkg": "cv2",        "import_name": "cv2",        "label": "OpenCV (opencv-contrib-python)"},
        {"pkg": "numpy",      "import_name": "numpy",      "label": "NumPy"},
        {"pkg": "PIL",        "import_name": "PIL",        "label": "Pillow"},
        {"pkg": "multipart",  "import_name": "multipart",  "label": "python-multipart"},
    ]
    results = []
    all_ok = True
    for dep in REQUIRED:
        try:
            mod = importlib.import_module(dep["import_name"])
            version = getattr(mod, "__version__", None) or getattr(mod, "VERSION", None) or "?"
            results.append({"pkg": dep["pkg"], "label": dep["label"], "ok": True, "version": str(version)})
        except ImportError:
            results.append({"pkg": dep["pkg"], "label": dep["label"], "ok": False, "version": None})
            all_ok = False

    model_present = YUNET_MODEL_PATH.exists()
    return {
        "all_ok": all_ok and model_present,
        "deps": results,
        "yunet_model_present": model_present,
        "yunet_model_path": str(YUNET_MODEL_PATH),
        "python": sys.version,
        "python_executable": sys.executable,
    }


@app.post("/api/install")
async def install_deps(request: Request) -> dict:
    """Run pip install — restricted to localhost for safety."""
    client_ip = request.client.host if request.client else "unknown"
    if client_ip not in ("127.0.0.1", "::1", "localhost"):
        raise HTTPException(status_code=403, detail="Install endpoint is only available from localhost.")
    req_path = Path(__file__).parent / "requirements.txt"
    if not req_path.exists():
        raise HTTPException(status_code=404, detail="requirements.txt not found next to main.py")

    log.info("Running: %s -m pip install -r %s", sys.executable, req_path)
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "--upgrade", "-r", str(req_path)],
            capture_output=True,
            text=True,
            timeout=300,
        )
        ok = result.returncode == 0
        if ok:
            log.info("pip install completed successfully")
        else:
            log.warning("pip install failed:\n%s", result.stderr)
        return {
            "ok": ok,
            "returncode": result.returncode,
            "stdout": result.stdout[-4000:] if result.stdout else "",
            "stderr": result.stderr[-2000:] if result.stderr else "",
            "message": "Dependencies installed — restart the server to apply." if ok else "Installation failed — see stderr for details.",
        }
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="pip install timed out after 5 minutes")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/detect")
async def detect_faces(
    image: UploadFile = File(...),
    robust: str = Form("false"),
) -> dict:
    """Detect faces in uploaded image with safety limits."""
    is_robust = robust.lower() in ("true", "1", "yes")
    t0 = time.perf_counter()

    # ── Validate MIME type ────────────────────────────────────────
    ctype = (image.content_type or "").lower()
    if ctype and not any(ctype.startswith(p) for p in ALLOWED_MIME_PREFIXES):
        raise HTTPException(status_code=400, detail=f"Unsupported content type: {ctype}")

    # ── Read with size limit ──────────────────────────────────────
    data = await image.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({len(data) // (1024*1024)} MB). Max is {MAX_UPLOAD_BYTES // (1024*1024)} MB.",
        )

    # ── Validate magic bytes ──────────────────────────────────────
    if not any(data[:8].startswith(sig) for sig, _ in IMAGE_MAGIC_BYTES):
        raise HTTPException(status_code=400, detail="File does not appear to be a valid image (bad magic bytes).")

    # ── Decode ────────────────────────────────────────────────────
    try:
        img_bgr = _decode_image(data)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Image decode failed: {exc}") from exc
    finally:
        del data  # free upload bytes early

    h, w = img_bgr.shape[:2]

    # ── Validate pixel count ──────────────────────────────────────
    if w * h > MAX_IMAGE_PIXELS:
        del img_bgr
        raise HTTPException(
            status_code=413,
            detail=f"Image too large ({w}x{h} = {w*h:,} pixels). Max is {MAX_IMAGE_PIXELS:,} pixels.",
        )

    # ── Detect ────────────────────────────────────────────────────
    faces: list[dict] = []
    try:
        if _detector_mode == "yunet":
            faces = _detect_yunet(img_bgr, robust=is_robust)
        elif _detector_mode == "haar":
            with _haar_lock:
                faces = _detect_haar(img_bgr, robust=is_robust)
        else:
            raise HTTPException(status_code=503, detail="No face detector available on server.")
    except HTTPException:
        raise
    except Exception as exc:
        log.error("Detection error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Face detection failed unexpectedly.") from exc
    finally:
        del img_bgr  # free decoded image immediately

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 1)
    log.info(
        "detect [%s%s]: %d faces in %dms (%dx%d)",
        _detector_mode,
        " robust" if is_robust else "",
        len(faces),
        elapsed_ms,
        w,
        h,
    )

    return {
        "faces": faces,
        "detector": _detector_mode,
        "image_width": w,
        "image_height": h,
        "elapsed_ms": elapsed_ms,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=7865, reload=True, log_level="info")
