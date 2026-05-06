# W3PN Anonymizer

> **Privacy-first photo & video anonymization — local-first, zero third-party data collection.**

A free, open-source tool by [Web3Privacy Now](https://www.web3privacy.info) for anonymizing faces and sensitive regions in images and videos. Rendering and export stay in your browser. Face detection runs either locally in-browser via YuNet + ONNX Runtime Web, or through your own optional localhost Python/OpenCV YuNet backend.

**[Try it online](https://anonymizer.web3privacy.info)** · [Source on GitHub](https://github.com/web3privacy/w3pn-anonymizer) · [Roadmap](./ROADMAP.md) · [Report a bug](https://github.com/web3privacy/w3pn-anonymizer/issues)

---

## Features

### Anonymization
- **14+ effects** — blur, heavy blur, pixelate, blackout, whiteout, emoji, silhouette, glitch, thermal, noise, swirl, contour, diamond, halftone
- **Auto face detection** — YuNet runs locally in your browser, with an optional localhost YuNet backend
- **Zone editing** — draw rectangles or paint with a brush over any region
- **Brush tool** — variable-size brush with real-time preview

### Image editing
- **Color adjustments** — brightness, contrast, saturation, shadows, highlights, temperature + presets
- **Transform effects** — halftone, glitch, pixel shift (wave/zoom/shear/ripple/mirror), color shift
- **Snapshot system** — save intermediate versions as new images in the explorer

### Video anonymization
- **Frame-by-frame processing** — masking, rendering, and encoding happen locally using Canvas API + MediaRecorder
- **Supported formats** — MP4, WebM, MOV, AVI, MKV, M4V, OGV
- **Manual frame fixes** — capture the current timeline frame, retouch it as an image, then bake it back into the next video render
- **Server optional** — in Server mode only still images or sampled detection frames may be sent to your localhost backend; rendering still happens in-browser

### Export & batch
- **6 image formats** — JPEG, PNG, WebP, BMP, GIF, TIFF
- **SVG vectorization** — convert images to SVG using imagetracer.js with 8 presets and custom parameters (live preview)
- **Batch processing** — resize, crop, format conversion, color grading, transforms, auto-anonymize across hundreds of photos
- **ZIP export** — download all processed photos at once

### Privacy & security
- **100% local by default** — images and videos never leave your device unless you explicitly switch detection to your own localhost backend
- **No analytics, no cookies, no tracking** — zero third-party requests
- **Self-hosted fonts** — Material Symbols served locally (no Google Fonts CDN)
- **Processing mode switch** — toggle between in-browser YuNet and optional localhost YuNet
- **CPU timing proof** — shows processing time to verify local execution
- **Optional Python backend** — runs on localhost only, never exposes data to the internet

### Desktop shell
- Electron support is kept in the codebase for future desktop releases
- Public desktop downloads are temporarily hidden until the installers are polished

---

## Quick start

### Web app (no install needed)

Visit **[anonymizer.web3privacy.info](https://anonymizer.web3privacy.info)** — everything runs in your browser.

### Run locally

```bash
# Clone and start
git clone https://github.com/web3privacy/w3pn-anonymizer.git
cd w3pn-anonymizer
npm install
npm run dev
# → http://localhost:5173
```

### With Python backend (optional, same YuNet detector on localhost)

```bash
./start.sh
```

This installs frontend dependencies if needed, ensures the Python backend virtualenv exists via `server/start.sh`, starts the detection backend on `http://127.0.0.1:7865`, and launches the Vite dev server.

You can also manage the backend directly:

```bash
./server/install.sh   # create/update ./server/.venv and fetch the YuNet model
./server/start.sh     # start only the localhost backend
```

---

## Desktop app

Desktop packaging is currently kept in the repository but hidden from public download links while the installers are polished. For now, use the web app or browse the source on [GitHub](https://github.com/web3privacy/w3pn-anonymizer).

### Build desktop app from source

```bash
# macOS
npm run electron:build

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux

# All platforms
npm run electron:build:all
```

Output goes to the `release/` directory. Release artifacts are grouped by platform and architecture, for example:

```text
release/
├── linux/arm64/       # AppImage + deb
├── linux/x64/         # AppImage + deb
├── macos/arm64/       # dmg + zip
├── macos/x64/         # dmg + zip
├── windows/arm64/     # installer exe + portable exe
└── windows/x64/       # installer exe + portable exe
```

Local macOS builds created without an Apple Developer ID are unsigned and not notarized. Sign and notarize the `.dmg` / `.zip` artifacts before publishing them as official macOS downloads.

---

## Project structure

```
w3pn-anonymizer/
├── src/
│   ├── App.tsx              # Main React application
│   ├── App.css              # Component styles
│   ├── index.css            # CSS variables (dark + light themes)
│   ├── main.tsx             # React entry point
│   ├── types.ts             # Shared TypeScript types
│   └── lib/
│       ├── detector.ts      # Face detection (YuNet WASM + backend)
│       ├── effects.ts       # Image effects engine (blur, pixelate, glitch…)
│       ├── normalize.ts     # Batch processing engine
│       ├── video.ts         # Video frame-by-frame processing
│       ├── vectorize.ts     # SVG vectorization (imagetracer.js)
│       └── image-encoders.ts # BMP, GIF, TIFF encoders
├── server/
│   ├── main.py              # FastAPI backend (OpenCV YuNet, localhost only)
│   ├── requirements.txt
│   └── models/              # Auto-downloaded ONNX models
├── electron/
│   └── main.cjs             # Electron main process
├── public/
│   ├── models/              # Browser-side YuNet ONNX model
│   ├── onnx/                # ONNX Runtime WebAssembly assets
│   ├── fonts/               # Self-hosted Material Symbols
│   ├── vendor/              # Browser image compression lib
│   └── demo/                # Demo images
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── start.sh                 # One-command start script
```

---

## Build for production

```bash
npm run build
# Output → dist/
```

The `dist/` folder is a static SPA deployable to any web server or CDN (Vercel, Netlify, nginx, Caddy, etc.).

For the optional Python backend, keep it bound to `127.0.0.1:7865` and place it behind a same-host reverse proxy only if you fully trust the runtime environment.

---

## Prerequisites

### Frontend
- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 9 (bundled with Node.js)

### Python backend (optional)
- **Python** ≥ 3.9 — [python.org](https://python.org)

| Package | Purpose |
|---------|---------|
| `fastapi` | HTTP API server |
| `uvicorn` | ASGI server |
| `opencv-contrib-python` | YuNet face detection |
| `pillow` | Image decode/encode |
| `numpy` | Array operations |
| `python-multipart` | File upload parsing |

The YuNet ONNX model is downloaded automatically from [OpenCV Zoo](https://github.com/opencv/opencv_zoo) on first startup.

---

## Detection modes

### Local mode

- The browser loads `public/models/face_detection_yunet_2023mar.onnx`.
- ONNX Runtime Web executes YuNet inside WebAssembly.
- Large images are scanned with full-frame inference plus 640 px tiles.
- Video detection samples are downscaled to 1280 px on the long edge before YuNet runs.
- No image or video pixels leave the browser.

### Server mode

- The browser still renders and encodes everything locally.
- Face detection requests are sent only to your own localhost backend at `127.0.0.1:7865`.
- The backend runs the same YuNet weights through OpenCV `FaceDetectorYN`.
- Only bounding boxes come back to the browser; source pixels are not stored on disk.

## Anonymization flow

### Still images

1. The app loads the source file into browser memory as a `Blob`.
2. A preview `ObjectURL` is created for the session UI.
3. Detection runs through the selected YuNet path:
   - `Local`: browser ONNX Runtime WebAssembly
   - `Server`: localhost FastAPI + OpenCV YuNet
4. The app stores only normalized face boxes and user-edited zones in React state.
5. Anonymization effects are rendered onto canvases in the browser.
6. Output is written to disk only if the user explicitly exports, downloads, or overwrites the original.

### Video

1. The source video stays in browser memory as a `Blob`.
2. The app samples detection frames across the timeline.
3. Detection uses the currently selected mode:
   - `Local`: sampled frames stay in-browser
   - `Server`: sampled frames may be POSTed to `127.0.0.1:7865` for bounding boxes only
4. Timeline interpolation, masking, frame overrides, and final encoding always stay in-browser.
5. Audio is preserved from the source stream when the browser runtime supports it.

### Persistence and cleanup

- The app stores loaded media, original backups, snapshots, zone masks, and temporary video overrides only in memory for the active session.
- Preview `ObjectURL`s are revoked when media is replaced or removed, and remaining previews are revoked when the app unloads.
- The app persists only two preferences in `localStorage`:
  - `anonymizer-theme`
  - `anonymizer-processing-local`
- The backend keeps only its virtual environment and YuNet model on disk:
  - `server/.venv/`
  - `server/models/face_detection_yunet_2023mar.onnx`
- The backend does not save uploaded image bytes or decoded frames to disk.

---

## Runtime limits

- Browser queue: up to 2,000 media items per session.
- Images: up to 50 MB per file in the browser queue.
- Videos: up to 500 MB per file in the browser queue.
- Localhost detection API: accepts JPEG, PNG, WebP, BMP, and TIFF up to 25 MB and 30 MP per request.
- Video detection: sampled frames are analyzed at up to 1280 px on the long edge.
- Video export: 6 Mbps video bitrate + 128 kbps audio bitrate.
- FPS handling: defaults to 30 fps when unavailable and normalizes detected rates into the 10-60 fps range.
- Batch resize controls: width and height inputs are clamped to 25,000 px.
- SVG preview: vectorization preview is capped to 1,200 px on the long edge for responsiveness.

---

## Data lifecycle

- Loaded media, zone masks, snapshots, original backups, and temporary video overrides live in memory as `Blob` / `ObjectURL` state for the current session.
- Preview `ObjectURL`s are revoked when media is replaced or deleted, and remaining previews are revoked when the app unloads.
- The app persists only two browser preferences in `localStorage`: the selected theme and the Local/Server processing mode.
- No image or video content is written to disk unless you explicitly export, download, or overwrite originals through the File System Access API.
- ZIP export re-encodes images through canvas, which strips EXIF, GPS, ICC, and other embedded metadata.
- The localhost Python backend decodes incoming detection requests in memory, returns bounding boxes, and immediately releases the buffers.

---

## Security & privacy

- **No third-party data leaves the device.** All rendering and export run locally, and Server mode only talks to your own localhost backend.
- **No server storage.** The Python backend processes detection requests in memory only. Nothing is written to disk.
- **No sessions, cookies, or tracking.** Pure SPA with no analytics, no remote logging, and no third-party API calls.
- **Self-hosted assets.** Fonts and model weights are bundled — no CDN requests at runtime.
- **CORS** on the backend is restricted to localhost origins. Never expose the Python backend directly to the internet.
- **Processing proof.** The app displays CPU timing after each detection to verify local execution.

---

## Recommended deployment

### Public web deployment

- Serve only the static frontend (`dist/`) publicly.
- Keep detection in Local mode so all pixel processing stays in the visitor's browser.
- Serve `.mjs` as `application/javascript`.
- Send:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Resource-Policy: same-origin`
- Apply the same resource policy to ONNX and WASM assets under `/onnx/` and `/models/`.

### Optional localhost / trusted-host backend

- Bind the Python backend to `127.0.0.1:7865` only.
- Prefer same-host reverse proxying of `/api/*` rather than opening the backend directly.
- Treat Server mode as a trusted-device feature, not as a public multi-tenant upload API.
- Keep logs local and avoid request body logging or disk persistence of uploaded frames.
- Keep the backend virtualenv and model cache on a local disk you control:
  - `server/.venv/`
  - `server/models/face_detection_yunet_2023mar.onnx`
- If you do place a reverse proxy in front, preserve localhost-only reachability and do not widen CORS beyond the app origin.

See [docs/RUNTIME_AND_PRIVACY.md](./docs/RUNTIME_AND_PRIVACY.md) for a fuller runtime, privacy, and deployment walkthrough.

---

## Tech stack

| Library | License | Purpose |
|---------|---------|---------|
| [React 18](https://react.dev) | MIT | UI framework |
| [Vite 5](https://vitejs.dev) | MIT | Build tool |
| [TypeScript](https://typescriptlang.org) | Apache 2.0 | Type safety |
| [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) | MIT | Browser-side YuNet inference (WebAssembly) |
| [OpenCV YuNet](https://github.com/opencv/opencv) | Apache 2.0 | Server face detection |
| [imagetracer.js](https://github.com/nicholasgasior/imagetracerjs) | MIT | Raster → SVG vectorization |
| [nodeca/pica](https://github.com/nodeca/pica) | MIT | High-quality image resizing |
| [smartcrop.js](https://github.com/jwagner/smartcrop.js) | MIT | Content-aware crop |
| [img-halftone](https://github.com/9am/img-halftone) | MIT | Halftone canvas effect |
| [JSZip](https://github.com/Stuk/jszip) | MIT/GPL | ZIP archive creation |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | MIT | File download trigger |
| [Electron](https://electronjs.org) | MIT | Desktop app shell |

---

## Contributing

Pull requests welcome! Please open an issue first for larger changes.

This project is part of [Web3Privacy Now](https://www.web3privacy.info) — building privacy tools that anyone can use and verify.

---

## License

MIT
