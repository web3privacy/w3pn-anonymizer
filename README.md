# W3PN Anonymizer

> **Privacy-first photo & video anonymization — local-first, zero third-party data collection.**

A free, open-source tool by [Web3Privacy Now](https://www.web3privacy.info) for anonymizing faces and sensitive data in **images, videos, audio, live camera/mic, and documents**. Detection, rendering, and export run entirely in your browser — faces via YuNet, optional objects via YOLO, and sensitive text via on-device OCR (Tesseract.js), all on [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) / WebAssembly. No uploads, no servers, no tracking.

**[Try it online](https://anonymizer.web3privacy.info)** · [Source on GitHub](https://github.com/web3privacy/w3pn-anonymizer) · [Roadmap](./ROADMAP.md) · [Custom image libraries](./docs/CUSTOM_IMAGE_LIBRARIES.md) · [Report a bug](https://github.com/web3privacy/w3pn-anonymizer/issues)

---

## Features

### Anonymization
- **10 effects** — blur, zoom blur, pixelate, blackout, emoji, custom image, ASCII art, glitch, animated Color Ball, and noise
- **Modular privacy detection** — faces (YuNet, on by default) plus optional YOLO targets: people, license plates, screens, documents, signs, tattoos
- **Sensitive text on photos** — opt-in on-device OCR (Tesseract.js, EN + CS) finds emails, phone numbers, payment cards, IBANs, national IDs, crypto addresses, secrets/keys, and more, then boxes and redacts them
- **Purposeful sensitivity defaults** — faces 25%, people 25%, plates 50%, documents/IDs and sensitive text 100%, vehicles and extra classes 10%
- **Progressive detection** — face boxes appear immediately while YOLO/OCR scans continue in the background
- **All YOLO classes** — an optional sheet exposes every raw class the object model supports for power users, beyond the featured targets
- **Tiny detection labels** — each detected region gets a small caption of its type (faces stay label-free), toggleable in settings
- **One effect per region** — cross-type de-duplication guarantees a single chosen effect is applied to any overlapping area
- **Auto detection** — runs locally in your browser (ONNX Runtime WebAssembly); cloud APIs are never used
- **Zone editing** — draw rectangles or paint with a brush over any region
- **Brush tool** — variable-size brush with real-time preview

### Image editing
- **Color adjustments** — brightness, contrast, saturation, shadows, highlights + presets
- **Transform effects** — halftone, glitch, pixel shift (wave/zoom/shear/ripple/mirror), color shift
- **Snapshot system** — save intermediate versions as new images in the explorer

### Video anonymization
- **Frame-by-frame processing** — masking, rendering, and encoding happen locally using Canvas API + MediaRecorder
- **Supported formats** — MP4, WebM, MOV, AVI, MKV, M4V, OGV
- **Video audio** — keep original track, remove audio on export, or apply voice-distortion presets (preview; mux export best-effort)
- **Manual frame fixes** — capture the current timeline frame, retouch it as an image, then bake it back into the next video render
- **100% in-browser** — video detection, masking, and encoding never leave your device

### Audio privacy
- **Audio files** — open WAV/MP3/OGG/M4A in a dedicated audio mode with a full-width waveform/sound graph
- **A/B comparison** — toggle between the original and the anonymized signal while scrubbing
- **Presets** — Maximum Mask, Heavy Scramble, Broken Timing (voice-modulation focused; no noise bed)
- **Advanced controls** — pitch, formant shift, ring modulation, bitcrush, tremolo/timing wobble, filters, and intensity
- **Export** — WAV (offline render) plus WebM/OGG/MP4 where the browser's `MediaRecorder` supports them
- **Limitations** — DSP-based disguise, not a guaranteed forensic defeat; no speech-to-text or speaker identification

### Live mode (camera + microphone)
- **Live camera** — real-time face/zone anonymization from the webcam, photo + video capture to library
- **Voice Mask** — live microphone de-identification via AudioWorklets; presets mirror audio mode (Maximum Mask, Heavy Scramble, Broken Timing, **Off** for raw recording)
- **Capture preview** — last photo/video thumbnail in the corner for quick open-in-editor
- **Local only** — capture, DSP, and recording never leave the device

### Document anonymization
- **Formats** — PDF, TXT, and MD (DOCX import is on the [roadmap](./ROADMAP.md))
- **Local PII detection** — regex + checksum recognizers (Luhn cards, IBAN mod-97, Czech rodné číslo mod-11, emails, phones, IPs, crypto, secrets/keys)
- **Review UI** — colored highlights over text and PDF page renders; toggle individual detections, draw manual redaction boxes
- **Redaction styles** — PDFs open with blackout selected; TXT/MD open directly in the anonymized blackout preview; blur/pixelate remain available for PDFs and token replacement for text
- **Safe export** — flattened PDF, ZIP of page images, or token-replaced TXT; Copy/Save for text documents

### Export & batch
- **6 image formats** — JPEG, PNG, WebP, BMP, GIF, TIFF
- **SVG vectorization** — convert images to SVG using imagetracer.js with 8 presets and custom parameters (live preview)
- **Batch processing** — resize, crop, format conversion, color grading, transforms, auto-anonymize across hundreds of photos
- **ZIP export** — download all processed photos at once

### Privacy & security
- **100% local** — images, videos, audio, mic, and documents never leave your device
- **No analytics, no cookies, no tracking** — zero third-party network requests at runtime
- **Self-hosted fonts and models** — Material Symbols, YuNet ONNX, optional YOLO ONNX, ORT WASM, and the Tesseract OCR engine + language data are all served from the same origin (no CDN)
- **CPU timing proof** — shows processing time to verify local execution
- **CSP + cross-origin isolation** — Content-Security-Policy and COOP/COEP/CORP headers in production

### Performance / loading
- **Lean first load** — only face detection (YuNet) and live mode load on boot
- **On-demand privacy models** — heavier YOLO/OCR assets start loading only after the user enables a target that needs them; one progress surface reports the complete model load and respects Save-Data / slow connections
- **Hypnotic home screen** — a high-detail, dotted multi-layer GPU spiral illusion (WebGL fragment shader, pixel-by-pixel, high FPS) that reacts to pointer/touch and morphs from the logo, with a `prefers-reduced-motion` / no-WebGL SVG fallback

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
│   ├── App.tsx                # Main React application
│   ├── App.css / index.css    # Core styles + CSS variables
│   ├── button-system.css      # Shared button typography and geometry
│   ├── main.tsx               # React entry point
│   ├── types.ts               # Shared TypeScript types
│   ├── components/            # UI (incl. document/ viewers, tool-panels/, batch/)
│   ├── desktop/ · mobile/     # Desktop and mobile shells / layouts
│   ├── hooks/                 # React hooks (detector, voice, library, prefetch…)
│   └── lib/
│       ├── detector.ts        # YuNet face detection orchestrator (WASM)
│       ├── detectors/         # YuNet + YOLO + OCR-PII detector implementations
│       ├── detections/        # Detection config, adapters, availability, image run
│       ├── effects.ts         # Image effects engine (blur, pixelate, glitch…)
│       ├── video.ts           # Video frame-by-frame processing
│       ├── audio/             # Audio pipeline, presets, and live voice-mask DSP
│       ├── document/          # PDF/TXT parsing, PII recognizers, redaction/export
│       ├── gl/                # WebGL renderers (hypno spiral)
│       ├── asset-prefetch.ts  # Background model/OCR cache warming
│       └── vectorize.ts       # SVG vectorization (imagetracer.js)
├── server/                    # Optional FastAPI backend (OpenCV YuNet, localhost only)
├── electron/                  # Electron main process
├── public/
│   ├── models/                # YuNet + optional privacy YOLO ONNX (see public/models/privacy/README.md)
│   ├── onnx/                  # ONNX Runtime WebAssembly assets
│   ├── tesseract/             # Self-hosted OCR engine (LSTM core) + eng/ces language data
│   ├── worklets/              # AudioWorklet processors (level meter, noise gate, voice mask)
│   ├── fonts/                 # Self-hosted Material Symbols
│   ├── vendor/                # Browser image compression + imagetracer libs
│   └── demo/                  # Demo images, audio, video, and a sample document
├── scripts/                   # Build/release tooling + Playwright e2e smokes
├── index.html · package.json · vite.config.ts · tsconfig.json
└── start.sh                   # One-command start script
```

---

## Build for production

```bash
npm run build
# Output → dist/
```

The `dist/` folder is a static SPA deployable to nginx, Caddy, Apache, or another static host. Production currently serves it from nginx on the W3PN VPS.

For the optional Python backend, keep it bound to `127.0.0.1:7865` and place it behind a same-host reverse proxy only if you fully trust the runtime environment.

---

## Prerequisites

### Frontend
- **Node.js** ≥ 20.19 — [nodejs.org](https://nodejs.org)
- **npm** ≥ 10 (bundled with current Node.js)

See [Dependencies and integrated runtimes](./docs/DEPENDENCIES.md) for the complete package, browser API, model, worker, desktop, native iOS/Android, and optional server inventory.

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

## Detection (in-browser)

- **Faces (YuNet)** — the browser loads `public/models/face_detection_yunet_2023mar.onnx` and runs it via ONNX Runtime Web (WebAssembly). Large images are scanned full-frame plus 640 px tiles; video samples are downscaled to 1280 px on the long edge first.
- **Objects (YOLO, optional)** — when a non-face target or a raw class is enabled, the matching YOLO ONNX model in `public/models/privacy/` lazy-loads through ORT. Outputs are thresholded using the per-target defaults, NMS'd, and cross-type de-duplicated so each region yields a single effect.
- **Sensitive text (OCR)** — when the *Sensitive text* target is on, Tesseract.js (self-hosted under `public/tesseract/`, EN + CS) recognizes words with bounding boxes; the document PII recognizers then locate matches and box them for redaction. Runs on still images only.
- No image, video, audio, or document pixels/text leave the browser.

## Anonymization flow

### Still images

1. The app loads the source file into browser memory as a `Blob`.
2. A preview `ObjectURL` is created for the session UI.
3. YuNet runs in-browser via ONNX Runtime WebAssembly.
4. The app stores only normalized face boxes and user-edited zones in React state.
5. Anonymization effects are rendered onto canvases in the browser.
6. Output is written to disk only if the user explicitly exports, downloads, or overwrites the original.

### Video

1. The source video stays in browser memory as a `Blob`.
2. The app samples detection frames across the timeline.
3. Sampled frames are detected in-browser with YuNet.
4. Timeline interpolation, masking, frame overrides, and final encoding stay in-browser.
5. Audio is preserved from the source stream when the browser runtime supports it.

### Persistence and cleanup

- The app stores loaded media, original backups, snapshots, zone masks, and temporary video overrides only in memory for the active session.
- Preview `ObjectURL`s are revoked when media is replaced or removed, and remaining previews are revoked when the app unloads.
- The app persists only UI preferences in `localStorage`:
  - `anonymizer-theme` — theme preference
  - `anonymizer-enable-optical-mode` — home logo / hypno animation toggle
  - `anonymizer-privacy-settings` — privacy target toggles, thresholds, label toggle, enabled raw classes, audio effect prefs (no media)
  - `anonymizer-voice-mask` — live voice-mask preset/strength prefs (no audio)
- `sessionStorage` may hold lightweight live-capture metadata (`anonymizer-live-meta`) — never image blobs.

---

## Runtime limits

- Browser queue: up to 2,000 media items per session.
- Images: up to 50 MB per file in the browser queue.
- Videos: up to 500 MB per file in the browser queue.
- Audio: up to 100 MB per file in the browser queue.
- OCR languages: English + Czech (self-hosted `tessdata_fast`, ~8 MB total).
- Video detection: sampled frames are analyzed at up to 1280 px on the long edge.
- Video export: 6 Mbps video bitrate + 128 kbps audio bitrate.
- FPS handling: defaults to 30 fps when unavailable and normalizes detected rates into the 10-60 fps range.
- Batch resize controls: width and height inputs are clamped to 25,000 px.
- SVG preview: vectorization preview is capped to 1,200 px on the long edge for responsiveness.

---

## Data lifecycle

- Loaded media, zone masks, snapshots, original backups, and temporary video overrides live in memory as `Blob` / `ObjectURL` state for the current session.
- Preview `ObjectURL`s are revoked when media is replaced or deleted, and remaining previews are revoked when the app unloads.
- The app persists only UI preferences in `localStorage` (theme, optical animation toggle).
- No image or video content is written to disk unless you explicitly export, download, or overwrite originals through the File System Access API.
- ZIP export re-encodes images through canvas, which strips EXIF, GPS, ICC, and other embedded metadata.

---

## Security & privacy

- **No data leaves the device.** All detection, rendering, and export run locally in the browser.
- **No sessions, cookies, or tracking.** Pure SPA with no analytics and no third-party API calls at runtime.
- **Self-hosted assets.** Fonts, ONNX models, WASM binaries, and the Tesseract OCR engine + language data are served from the same origin.
- **CSP + isolation headers.** Content-Security-Policy and COOP/COEP/CORP configured for production (see `vercel.json`).
- **Processing proof.** The app displays CPU timing after each detection to verify local execution.

---

## Recommended deployment

### Public web deployment

```bash
npm run build
npm run release:audit
# Deploy dist/ to static hosting (e.g. Vercel)
```

Requirements:

- Production domain and metadata must remain `https://anonymizer.web3privacy.info`
- Serve `.mjs` as `application/javascript`
- Ensure `public/models/`, `public/onnx/`, `public/tesseract/`, and `public/worklets/` assets are included in the deployment
- Headers (configured in `vercel.json`):
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Content-Security-Policy` (see `vercel.json`)
- Apply the same headers to model/WASM/OCR assets under `/onnx/`, `/models/`, and `/tesseract/`
- Treat tracked `dist/` files as release artifacts, not source of truth. If `npm run release:audit`
  warns about ignored untracked `dist/assets/*` references, either include the matching build
  artifacts intentionally or deploy from the fresh source build output.

See [docs/RUNTIME_AND_PRIVACY.md](./docs/RUNTIME_AND_PRIVACY.md) for a fuller runtime, privacy, and deployment walkthrough, and [docs/RELEASE_CLEANUP_PLAN.md](./docs/RELEASE_CLEANUP_PLAN.md) for the current cleanup checklist.

---

## Tech stack

| Library | License | Purpose |
|---------|---------|---------|
| [React 18](https://react.dev) | MIT | UI framework |
| [Vite 5](https://vitejs.dev) | MIT | Build tool |
| [TypeScript](https://typescriptlang.org) | Apache 2.0 | Type safety |
| [ONNX Runtime Web](https://github.com/microsoft/onnxruntime) | MIT | Browser-side YuNet + YOLO inference (WebAssembly) |
| [Tesseract.js](https://github.com/naptha/tesseract.js) | Apache 2.0 | On-device OCR for sensitive-text detection (self-hosted) |
| [pdf.js (`pdfjs-dist`)](https://github.com/mozilla/pdf.js) | Apache 2.0 | PDF parsing + page rendering for document mode |
| [jsPDF](https://github.com/parallax/jsPDF) | MIT | Flattened (redacted) PDF export |
| [OpenCV YuNet](https://github.com/opencv/opencv) | Apache 2.0 | Server face detection (optional backend) |
| [imagetracer.js](https://github.com/nicholasgasior/imagetracerjs) | MIT | Raster → SVG vectorization |
| [nodeca/pica](https://github.com/nodeca/pica) | MIT | High-quality image resizing |
| [smartcrop.js](https://github.com/jwagner/smartcrop.js) | MIT | Content-aware crop |
| [img-halftone](https://github.com/9am/img-halftone) | MIT | Halftone canvas effect |
| [mp4-muxer / webm-muxer](https://github.com/Vanilagy) | MIT | In-browser video (re)muxing on export |
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
