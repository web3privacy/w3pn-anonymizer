# W3PN Anonymizer

> **Privacy-first photo & video anonymization — 100% local, zero data collection.**

A free, open-source tool by [Web3Privacy Now](https://www.web3privacy.info) for anonymizing faces and sensitive regions in images and videos. Everything runs in your browser — no uploads, no servers, no tracking.

**[Try it online](https://anonymizer.web3privacy.info)** · [Download desktop app](#desktop-app) · [Roadmap](./ROADMAP.md) · [Report a bug](https://github.com/web3privacy/w3pn-anonymizer/issues)

---

## Features

### Anonymization
- **14+ effects** — blur, heavy blur, pixelate, blackout, whiteout, emoji, silhouette, glitch, thermal, noise, swirl, contour, diamond, halftone
- **Auto face detection** — browser-side AI (face-api.js / TensorFlow.js) detects faces automatically
- **Zone editing** — draw rectangles or paint with a brush over any region
- **Brush tool** — variable-size brush with real-time preview

### Image editing
- **Color adjustments** — brightness, contrast, saturation, shadows, highlights, temperature + presets
- **Transform effects** — halftone, glitch, pixel shift (wave/zoom/shear/ripple/mirror), color shift
- **Snapshot system** — save intermediate versions as new images in the explorer

### Video anonymization
- **Frame-by-frame processing** — fully local video anonymization using Canvas API + MediaRecorder
- **Supported formats** — MP4, WebM, MOV, AVI, MKV, M4V, OGV
- **Manual frame fixes** — capture the current timeline frame, retouch it as an image, then bake it back into the next video render
- **No server needed** — all processing happens in the browser

### Export & batch
- **6 image formats** — JPEG, PNG, WebP, BMP, GIF, TIFF
- **SVG vectorization** — convert images to SVG using imagetracer.js with 8 presets and custom parameters (live preview)
- **Batch processing** — resize, crop, format conversion, color grading, transforms, auto-anonymize across hundreds of photos
- **ZIP export** — download all processed photos at once

### Privacy & security
- **100% local processing** — images and videos never leave your device
- **No analytics, no cookies, no tracking** — zero external requests
- **Self-hosted fonts** — Material Symbols served locally (no Google Fonts CDN)
- **Processing mode switch** — toggle between local-only and optional server-assisted detection
- **CPU timing proof** — shows processing time to verify local execution
- **Optional Python backend** — runs on localhost only, never exposes data to the internet

### Desktop app
- **macOS** — .dmg installer (Apple Silicon + Intel)
- **Windows** — .exe installer + portable
- **Linux** — AppImage + .deb package
- Built with Electron, ships the complete app offline

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

### With Python backend (optional, higher accuracy)

```bash
./start.sh
```

This installs Python dependencies, starts the detection backend on `http://127.0.0.1:7865`, and launches the Vite dev server.

---

## Desktop app

Download the latest release for your platform:

| Platform | Download | Format |
|----------|----------|--------|
| **macOS** | [W3PN-Anonymizer.dmg](https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer.dmg) | .dmg installer |
| **Windows** | [W3PN-Anonymizer-Setup.exe](https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer-Setup.exe) | .exe installer |
| **Linux** | [W3PN-Anonymizer.AppImage](https://github.com/web3privacy/w3pn-anonymizer/releases/latest/download/W3PN-Anonymizer.AppImage) | AppImage |

Or browse [all releases](https://github.com/web3privacy/w3pn-anonymizer/releases).

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

Output goes to the `release/` directory.

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
│       ├── detector.ts      # Face detection (face-api.js + backend)
│       ├── effects.ts       # Image effects engine (blur, pixelate, glitch…)
│       ├── normalize.ts     # Batch processing engine
│       ├── video.ts         # Video frame-by-frame processing
│       ├── vectorize.ts     # SVG vectorization (imagetracer.js)
│       └── image-encoders.ts # BMP, GIF, TIFF encoders
├── server/
│   ├── main.py              # FastAPI backend (OpenCV YuNet)
│   ├── requirements.txt
│   └── models/              # Auto-downloaded ONNX models
├── electron/
│   └── main.cjs             # Electron main process
├── public/
│   ├── models/              # TensorFlow.js face detection weights
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

For the Python backend in production, run it behind a reverse proxy that routes `/api/*` to the backend on port 7865.

---

## Prerequisites

### Frontend
- **Node.js** ≥ 18 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 9 (bundled with Node.js)

### Python backend (optional)
- **Python** ≥ 3.10 — [python.org](https://python.org)

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

## Security & privacy

- **No data leaves the device.** All image processing runs locally via Canvas 2D API, WebGL (TensorFlow.js), and the optional localhost Python backend.
- **No server storage.** The Python backend processes images in memory only. Nothing is written to disk.
- **No sessions, cookies, or tracking.** Pure SPA with no analytics, no remote logging, no external API calls.
- **Self-hosted assets.** Fonts and model weights are bundled — no CDN requests at runtime.
- **CORS** on the backend is restricted to `127.0.0.1`. Never expose the Python backend to the internet.
- **Processing proof.** The app displays CPU timing after each detection to verify local execution.

---

## Tech stack

| Library | License | Purpose |
|---------|---------|---------|
| [React 18](https://react.dev) | MIT | UI framework |
| [Vite 5](https://vitejs.dev) | MIT | Build tool |
| [TypeScript](https://typescriptlang.org) | Apache 2.0 | Type safety |
| [vladmandic/face-api](https://github.com/vladmandic/face-api) | MIT | Browser face detection (TensorFlow.js) |
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
