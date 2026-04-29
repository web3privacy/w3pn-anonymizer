# W3PN Anonymizer

> **Local-first photo anonymization — 100% private, runs entirely on your machine.**

A privacy tool by the [Web3Privacy Now](https://www.web3privacy.info) community.  
Source: [github.com/web3privacy/w3pn-anonymizer](https://github.com/web3privacy/w3pn-anonymizer)

---

## What it does

- 🎭 **Anonymize faces** — blur, pixelate, blackout, emoji, glitch, thermal, halftone, and more
- ✏️ **Brush & zone tools** — paint or draw rectangles over any region
- 🤖 **Auto face detection** — browser-side AI (face-api.js / TensorFlow.js) + optional local Python backend (OpenCV YuNet) for higher accuracy
- 🎨 **Color adjustments** — brightness, contrast, saturation, shadows, highlights + presets
- 🌀 **Transform effects** — halftone, glitch, pixel shift (wave/zoom/shear/ripple/mirror), color shift
- 📐 **Batch processing** — resize, crop, format conversion, color grading, transforms, auto-anonymize — across hundreds of photos
- 📦 **ZIP export** — download all processed photos at once
- 🌙 **100% local** — no photo ever leaves your device, no cloud, no telemetry, no tracking
- 🌐 **Online mode** — works as a pure web app with file upload + download (no write access to disk)

---

## Quick start

### Option A — one command (recommended)

```bash
./start.sh
```

Installs Python dependencies, starts the detection backend on `http://127.0.0.1:7865`, and starts the Vite frontend on `http://localhost:5173`.

### Option B — manual

**1. Frontend** (requires Node.js ≥ 18)

```bash
npm install
npm run dev
# → http://localhost:5173
```

**2. Python detection backend** (optional, in a separate terminal)

```bash
cd server
pip install -r requirements.txt
python main.py
# → http://127.0.0.1:7865
```

The app works fully without the Python backend — it uses the browser-side face-api.js detector. The Python backend (OpenCV YuNet) provides higher detection accuracy for batch jobs and difficult images.

---

## Installation prerequisites

### Node.js (frontend)

- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 9 (bundled with Node.js)

```bash
node --version   # should print v18.x or higher
npm --version
npm install      # installs all frontend dependencies
```

### Python (optional backend)

- **Python** ≥ 3.10 — [python.org](https://python.org)
- **pip** (bundled with Python)

```bash
python3 --version   # should print 3.10 or higher
cd server
pip install -r requirements.txt
```

Dependencies installed:

| Package | Purpose |
|---|---|
| `fastapi` | HTTP API server |
| `uvicorn` | ASGI server |
| `opencv-contrib-python` | YuNet face detection |
| `pillow` | Image decode/encode |
| `numpy` | Array operations |
| `python-multipart` | File upload parsing |

The YuNet ONNX model (`face_detection_yunet_2023mar.onnx`) is downloaded automatically from the [OpenCV Zoo](https://github.com/opencv/opencv_zoo) on first startup.

### Face detection model (browser)

The browser-side TensorFlow.js / face-api.js weights are loaded at runtime from the `public/` folder (or CDN). No manual download needed.

---

## Project structure

```
w3pn-anonymizer/
├── src/
│   ├── App.tsx           # Main React application (~3300 lines)
│   ├── App.css           # All component styles
│   ├── index.css         # CSS variables / themes (dark + light)
│   ├── main.tsx          # React entry point
│   ├── types.ts          # Shared TypeScript types
│   └── lib/
│       ├── effects.ts    # All image effects (blur, pixelate, glitch, halftone…)
│       ├── detector.ts   # Face detection (face-api.js + backend API)
│       └── normalize.ts  # Batch processing engine
├── server/
│   ├── main.py           # FastAPI backend (YuNet + Haar fallback)
│   ├── requirements.txt
│   └── models/           # Auto-downloaded ONNX models
├── public/               # Static assets (favicon, etc.)
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── start.sh              # One-command start script
```

---

## Build for production

```bash
npm run build
# Output: dist/
```

The `dist/` folder is a static single-page app that can be served from any web server or CDN (Vercel, Netlify, nginx, etc.).

For the Python backend in production, run it behind a reverse proxy (nginx/Caddy) that exposes `/api/*` to the frontend.

---

## Security & privacy

- **No data leaves the device.** All image processing runs locally: Canvas 2D API, WebGL (TensorFlow.js), and the optional localhost Python backend.
- **No server storage.** The Python backend does not write uploaded images to disk. It decodes the image in memory, runs detection, and returns JSON. Images are discarded immediately after the response.
- **No sessions, no cookies, no tracking.** The frontend is a pure SPA with no analytics, no remote logging, and no external API calls (except loading open-source model weights on first use).
- **CORS** on the backend is permissive by default (`allow_origins=["*"]`) because it only listens on `127.0.0.1`. Never expose the Python backend to the internet.
- **Online mode** (when served from a web server): users upload photos which live only in browser memory. Each browser session is isolated. No temp files are written. Navigating away clears all data from memory.
- **Model weights** — face-api.js weights are fetched once and cached by the browser. The YuNet model is downloaded from the official OpenCV Zoo repository over HTTPS.

---

## Open-source dependencies

| Library | License | Purpose |
|---|---|---|
| [vladmandic/face-api](https://github.com/vladmandic/face-api) | MIT | Browser-side face detection (TensorFlow.js) |
| [opencv/opencv YuNet](https://github.com/opencv/opencv) | Apache 2.0 | Server-side face detection |
| [nodeca/pica](https://github.com/nodeca/pica) | MIT | High-quality image resizing |
| [Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | MIT | Batch image compression |
| [jwagner/smartcrop.js](https://github.com/jwagner/smartcrop.js) | MIT | Content-aware crop |
| [9am/img-halftone](https://github.com/9am/img-halftone) | MIT | Halftone canvas effect |
| [Stuk/jszip](https://github.com/Stuk/jszip) | MIT/GPL | ZIP archive creation |
| [eligrey/FileSaver.js](https://github.com/eligrey/FileSaver.js) | MIT | File download trigger |
| React 18 | MIT | UI framework |
| Vite 5 | MIT | Build tool |

---

## Desktop app packaging (macOS / Windows / Linux)

The app can be packaged as a self-contained native desktop application using [Tauri](https://tauri.app) (recommended — small bundle, Rust core) or [Electron](https://www.electronjs.org) (larger bundle, broader compatibility).

### Option A — Tauri (recommended)

Tauri bundles the Vite frontend into a native WebView. Bundle size ~5–15 MB.

```bash
# Prerequisites
cargo --version   # Rust toolchain — https://rustup.rs
npm install

# Add Tauri to the project
npm create tauri-app@latest -- --template vite-react-ts
# or, if adding to existing project:
npm install --save-dev @tauri-apps/cli
npx tauri init

# Development
npx tauri dev

# Build native installer
npx tauri build
# Output: src-tauri/target/release/bundle/
#   macOS  → .dmg / .app
#   Windows → .msi / .exe
#   Linux  → .deb / .AppImage
```

To include the Python backend, add it as a sidecar binary in `tauri.conf.json` (`"externalBin"`) or start it from a Tauri command at launch. Alternatively, replace the Python backend with a Rust-based implementation.

### Option B — Electron

```bash
npm install --save-dev electron electron-builder

# Add a main.js entry point for Electron
# Build
npx electron-builder --mac --win --linux
# Output: dist/ with platform-specific installers
```

Bundle size is typically 80–150 MB because Electron ships Chromium.

### Bundling the Python backend

For a truly self-contained app, use [PyInstaller](https://pyinstaller.org) to bundle `server/main.py` into a standalone binary:

```bash
cd server
pip install pyinstaller
pyinstaller --onefile main.py --add-data "models/:models/"
# Output: dist/main (or dist/main.exe on Windows)
```

Then ship this binary alongside the Tauri/Electron app and spawn it at startup.

---

## Contributing

Pull requests welcome! Please open an issue first for larger changes.

This project is part of the [Web3Privacy Now](https://www.web3privacy.info) initiative — building privacy tools that anyone can use and verify.
