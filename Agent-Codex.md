# Agent Codex — W3PN Anonymizer

This document is the current maintenance guide for the repository.

## Project summary

- Name: `W3PN Anonymizer`
- Purpose: privacy-first image and video anonymization
- Frontend stack: `React 18`, `TypeScript`, `Vite`, `Canvas 2D API`
- Active detector everywhere: `YuNet`
- Local detector: browser `onnxruntime-web` + `public/models/face_detection_yunet_2023mar.onnx`
- Server detector: localhost `FastAPI` + OpenCV `FaceDetectorYN`
- Repo root: `/Users/coinmandeer/Documents/GitHub/w3pn-anonymizer`

## Current architecture

### Frontend

- `src/App.tsx`
  Main application shell, UI, state, image editing, batch actions, dialogs, and video controls.
- `src/lib/detector.ts`
  Unified face detection orchestrator. Uses only:
  1. localhost backend in `Server` mode
  2. browser YuNet WASM in `Local` mode or as a fallback when the backend is unavailable
- `src/lib/yunet-wasm.ts`
  Browser-side YuNet loader and inference bridge for ONNX Runtime Web.
- `src/lib/video.ts`
  Video pipeline. Builds sampled detections, stabilizes tracks, expands a per-frame mask map, and renders/encodes in-browser.
- `src/lib/video-timeline.worker.ts`
  Worker for expanding the tracked keyframes into per-frame mask data.
- `src/lib/effects.ts`
  Anonymization and transform effects.
- `src/lib/normalize.ts`
  Batch resize/crop/format pipeline.
- `src/lib/vectorize.ts`
  SVG vectorization preview/export.

### Backend

- `server/main.py`
  Local-only detection API on `127.0.0.1:7865`.
- `server/install.sh`, `server/install.bat`
  Create `server/.venv`, install Python dependencies, and fetch the YuNet ONNX model.
- `server/start.sh`, `server/start.bat`
  Start the localhost backend.

### Runtime assets

- Browser YuNet model: `public/models/face_detection_yunet_2023mar.onnx`
- Browser ONNX runtime assets: `public/onnx/*`
- Backend YuNet model cache: `server/models/face_detection_yunet_2023mar.onnx`

## Processing modes

### Local mode

- `setForceLocal(true)`
- Detection runs in the browser with YuNet WASM.
- Large images use a full-frame pass plus overlapping `640px` tiles.
- Video detection samples are downscaled to at most `1280px` on the long edge.
- Rendering, masking, previews, and export stay in-browser.

### Server mode

- `setForceLocal(false)`
- Detection requests are posted only to `http://127.0.0.1:7865/api/detect`.
- The backend decodes input bytes in memory, runs OpenCV YuNet, returns face boxes, and releases buffers immediately.
- For video, only sampled detection frames may be sent to the backend. Timeline expansion, masking, and final encoding still remain in the browser.

## Data handling

- Loaded media is kept in memory as `Blob`s and preview `ObjectURL`s.
- Preview URLs are revoked when media is replaced, removed, or when the app unmounts.
- The app persists only:
  - `anonymizer-theme`
  - `anonymizer-processing-local`
- No image or video payload is stored in `localStorage`, IndexedDB, cookies, or analytics services.
- Files are written only when the user explicitly exports, downloads, or overwrites originals.
- The backend stores only its virtualenv and the YuNet model on disk. It does not persist uploaded source pixels.

## Operational limits

- Browser queue limit: `2000` media items
- Image input limit: `50 MB` per file
- Video input limit: `500 MB` per file
- Backend detect request limit: `25 MB`
- Backend decoded image limit: `30,000,000` pixels
- Video detection long edge: `1280px`
- Default video FPS fallback: `30`
- Normalized video FPS range: `10-60`
- Video export bitrate: `6 Mbps` video + `128 kbps` audio
- Batch resize input clamp: `25,000px`
- SVG preview long edge cap: `1200px`

## Recommended deployment

- Public deployment: serve only the static frontend and keep users in `Local` mode.
- Trusted-device deployment: allow the optional localhost backend, but keep it bound to `127.0.0.1`.
- Do not expose the Python backend directly to the public internet.
- Keep request logging minimal and avoid request body logging.

## Verification

- Frontend build: `npm run build`
- Backend syntax check: `python -m py_compile server/main.py`
- Full local dev start on macOS/Linux: `./start.sh`

## Notes for future cleanup

- The repo intentionally keeps a single detection family now: YuNet.
- If new detector experiments are added later, they should live behind clearly isolated files and should not replace the default single-path production flow without fresh benchmarks.
