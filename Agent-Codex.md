# Agent Codex — W3PN Anonymizer

> **Purpose of this file**: This document contains everything an AI agent needs to
> understand, maintain, and extend the W3PN Anonymizer codebase. It is the single
> source of truth for architecture, conventions, file roles, feature inventory,
> state management, processing pipelines, known issues, and project philosophy.

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Name** | W3PN Anonymizer |
| **Owner** | Web3Privacy Now |
| **Purpose** | Privacy-first photo and video anonymization tool |
| **Stack** | React 18 · TypeScript · Vite · Canvas API · face-api.js (TensorFlow.js) · optional Python/OpenCV backend |
| **Core principle** | Everything runs locally in the user's browser. No data ever leaves the device. |
| **Repo root** | `/Users/lubos.kral/Desktop/ANONYMIZER` |
| **Contact** | web3privacynow@protonmail.com |

---

## 2. Architecture & File Structure

### 2.1 Frontend (`src/`)

| File | Role |
|------|------|
| `src/App.tsx` | **Main application component (~4 500 lines).** Contains ALL UI, state management, effects pipeline, batch processing, video processing, export logic, and dialogs. This is a single-file React app — there are no child component files. |
| `src/App.css` | All styling. Uses CSS variables for theming (light/dark mode via `data-theme` attribute on the `<html>` element). |
| `src/types.ts` | TypeScript interfaces: `PhotoItem`, `Zone`, `NormalizeFormat` (includes `image/bmp`, `image/gif`, `image/tiff`), `VectorizeParams`, `VectorizePreset`. |
| `src/lib/detector.ts` | Face detection orchestrator. Priority chain: 1) Python backend (`/api/detect`), 2) Native browser `FaceDetector` API, 3) face-api.js `TinyFaceDetector`. Has a `_forceLocal` flag that skips the backend when `true`. Exposes a progress-callback system for UI updates. Performs a warmup inference for WebGL shader compilation. |
| `src/lib/effects.ts` | 14+ anonymization effects (blur, pixelate, blackout, emoji, glitch, thermal, halftone, silhouette, noise, swirl, contour, diamond, crosshatch, etc.). Also color adjustments (brightness, contrast, saturation, shadows, highlights, temperature) and transform effects (halftone, glitch, pixel-shift variants). |
| `src/lib/normalize.ts` | Image normalization: resize, crop, format conversion. Supports JPEG, PNG, WebP, BMP, GIF, TIFF via custom encoders. |
| `src/lib/image-encoders.ts` | Custom browser-side encoders for BMP, GIF, TIFF (the native `canvas.toBlob` does not support these formats). |
| `src/lib/video.ts` | Video processing pipeline: local sampled detection prepass → tracked timeline → worker-built per-frame mask map → continuous `MediaRecorder` + `captureStream` re-encoding with original audio. Forces local mode during processing. |
| `src/lib/video-timeline.worker.ts` | Local Web Worker that expands tracked video keyframes into per-frame anonymization zones before realtime rendering. |
| `src/lib/vectorize.ts` | SVG vectorization using `imagetracer.js`. 8 presets, custom parameters, internal downscaling for large images (`MAX_VECTORIZE_DIM = 1200 px`). |
| `src/lib/imagetracerjs.d.ts` | TypeScript declarations for the `imagetracerjs` module. |

### 2.2 Server (`server/`)

| File | Role |
|------|------|
| `server/main.py` | FastAPI server for face detection using OpenCV YuNet. Endpoints: `/api/status`, `/api/detect`, `/api/deps`, `/api/install`. Binds to `127.0.0.1:7865`. |
| `server/requirements.txt` | Python deps: `fastapi`, `uvicorn`, `opencv-contrib-python`, `pillow`, `numpy`, `python-multipart`. |
| `server/install.sh` / `server/install.bat` | Platform-specific dependency installers. |
| `server/start.sh` / `server/start.bat` | Platform-specific server launchers. |
| `server/setup-and-run.sh` / `server/setup-and-run.bat` | Combined install + start scripts (downloadable from the UI). |

### 2.3 Desktop App (Electron)

| File | Role |
|------|------|
| `electron/main.cjs` | Electron main process. `BrowserWindow` setup, IPC handlers for Python backend management (`check-python`, `install-deps`, `start-server`). Kills the backend on app quit. |
| `electron/preload.cjs` | Secure context bridge exposing `window.electronBackend` API: `isElectron()`, `checkPython()`, `installDeps()`, `startServer()`. |
| `package.json` | Contains `electron-builder` config for macOS (`.dmg`), Windows (`.exe`), Linux (`.AppImage`). Scripts: `desktop:mac`, `desktop:win`, `desktop:linux`. |

### 2.4 Build & Config

| File | Role |
|------|------|
| `vite.config.ts` | `base: './'` for Electron compatibility. React plugin. |
| `index.html` | SEO meta tags, Open Graph, Twitter Cards, JSON-LD structured data. Self-hosted fonts (no external CDN). |
| `.github/workflows/build-desktop.yml` | CI/CD for desktop builds on tag push. |

### 2.5 Public Assets (`public/`)

| Path | Contents |
|------|----------|
| `public/models/` | face-api.js `TinyFaceDetector` weights (~190 KB). Loaded via relative path `'./models'`. |
| `public/vendor/` | Worker codec library for image processing. |
| `public/fonts/` | Self-hosted Material Symbols font (`material-symbols-400.ttf` + CSS). |
| `public/demo/` | Demo images for the "Demo" button on the welcome screen. |
| `public/og-image.png` | Social sharing image. |
| `public/robots.txt` / `public/sitemap.xml` | SEO. |

---

## 3. Key Features — Complete Inventory

| # | Feature | Details |
|---|---------|---------|
| 1 | **Face Detection** | 3-tier chain: Python YuNet backend → Native browser `FaceDetector` API → face-api.js. Auto-detect on photo open. Orange button when backend offline, red when detection fails. |
| 2 | **14+ Anonymization Effects** | Blur (gaussian, box, motion), pixelate, blackout, emoji (100+ unique), glitch, thermal, halftone, silhouette, noise, swirl, contour, diamond, crosshatch. |
| 3 | **Brush & Zone Tools** | Rectangle zones from auto-detect, manual rectangle draw, freehand brush painting. |
| 4 | **Color Adjustments** | Brightness, contrast, saturation, shadows, highlights, temperature — with presets. |
| 5 | **Transform Effects** | Halftone, glitch, pixel shift (wave / zoom / shear / ripple / mirror), color shift. |
| 6 | **Video Anonymization** | Frame-by-frame processing, face re-detection every 15 frames, `MediaRecorder` re-encoding. |
| 7 | **SVG Vectorization** | `imagetracer.js`, 8 presets, custom params (colors, smoothing, corner threshold), live preview. |
| 8 | **Batch Processing** | Resize, crop, format convert, color grade, transform, auto-anonymize. ZIP export. |
| 9 | **Export Formats** | JPEG, PNG, WebP, BMP, GIF, TIFF + SVG vectorization. |
| 10 | **Save Snapshot** | Clone current edited state as a new photo in the explorer. |
| 11 | **Local / Server Toggle** | Default: Local. Preference persisted in `localStorage`. Dynamic privacy badge text. |
| 12 | **Privacy Hardening** | No external CDNs, self-hosted fonts, CSP-ready, CPU timing proof during detection. |
| 13 | **Desktop Apps** | Electron: macOS (`.dmg`), Windows (`.exe`), Linux (`.AppImage`). One-click Python backend install via IPC. |
| 14 | **Welcome Screen** | Feature cards, drag-and-drop overlay, demo button. |
| 15 | **About Dialog** | Feature list, open-source credits, feedback form (mailto link). |
| 16 | **Light / Dark Theme** | Toggle in header, persisted in `localStorage`. |

---

## 4. State Management Principles

- **No external state library.** All state lives as React `useState` / `useRef` hooks inside `App.tsx`.
- `workCanvasRef` — off-screen `<canvas>` holding the current image at **original resolution**.
- `zonesByPhoto` — `Map<photoId, Zone[]>` for per-photo zone persistence.
- `activePhoto` — derived from the `photos` array + `activePhotoId`.
- Effects are applied **cumulatively**: each new effect writes to `workCanvas` on top of the previous state.
- `renderCanvas()` — redraws the display canvas from `workCanvas` + zone overlays.

---

## 5. Processing Modes

| Mode | Flags | Behavior |
|------|-------|----------|
| **Local** (default) | `processingLocal = true`, `_forceLocal = true` | Backend is skipped entirely. face-api.js is used for detection. |
| **Server** | `processingLocal = false`, `_forceLocal = false` | Tries the Python backend first, then falls back to browser-based detection on failure. |

---

## 6. Face Detection Flow (`detector.ts`)

1. **`initializeDetector()`** — Checks the backend (unless `forceLocal`), then the native browser API, then face-api.js. Caches the result.
2. **`detectFaces(canvas, robust)`** — Uses the initialized detector. Falls through the chain on failure.
3. **`ensureFaceApi()`** — Loads the TF.js WebGL backend, loads model weights from `./models`, runs a warmup inference (128 × 128 dummy canvas) to pre-compile WebGL shaders.
4. **Progress reporting** — Via `setDetectionProgressCallback` → the UI shows step descriptions and an elapsed-time timer.

---

## 7. UI Layout (`App.tsx`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER                                                              │
│  Logo (→ About dialog) │ Tagline │ "Downloadable" menu │ Privacy    │
│  shield │ Privacy badge │ Local/Server toggle │ Demo button          │
├──────────┬───────────────────────────────────────┬───────────────────┤
│  LEFT    │  CENTER                               │  RIGHT            │
│  SIDEBAR │                                       │  SIDEBAR          │
│          │  Tool strip:                          │                   │
│  Photo   │  auto-detect · zone tools · brush ·   │  Tool Settings    │
│  explorer│  effects · adjustments · transforms · │  panel:           │
│  (thumbs,│  vectorize                            │  effect params,   │
│  multi-  │                                       │  zone list,       │
│  select, │  Preview canvas / Video player        │  batch settings,  │
│  video   │                                       │  export format /  │
│  badge)  │  Detecting overlay + progress         │  quality          │
├──────────┴───────────────────────────────────────┴───────────────────┤
│  MODALS: About · DepsModal (face detection setup) · Feedback form   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 8. CSS Architecture (`App.css`)

- Root variables defined in `:root` (dark mode defaults).
- Light mode overrides via `[data-theme="light"]` selector.
- Component-scoped class prefixes:
  - `.ts-btn` — tool-strip buttons
  - `.tb-btn` — toolbar buttons
  - `.panel-*` — right-sidebar panel sections
- Special classes:
  - `.ts-btn-setup` — orange tint for the face-detection button when the backend is offline.
  - `.deps-install-btn` — prominent orange install button inside the deps dialog.
- Light mode has specific overrides for header, sliders, buttons, and dropdowns.

---

## 9. Build & Deploy

| Command | What it does |
|---------|-------------|
| `npm run build` | Vite production build → `dist/` |
| `npm run desktop:mac` | Electron macOS build (`.dmg`) |
| `npm run desktop:win` | Electron Windows build (`.exe`) |
| `npm run desktop:linux` | Electron Linux build (`.AppImage`) |

**Web deploy:** Upload `dist/` to a VPS. Static hosting (nginx / Apache).

**Desktop deploy:** Upload executables to GitHub Releases, linked from `README.md`.

---

## 10. Known Issues & Challenges

| # | Issue | Mitigation |
|---|-------|-----------|
| 1 | **TF.js first-run shader compilation** — Takes 10–60 s on first detection. | Warmup inference + progress UI. |
| 2 | **face-api.js TinyFaceDetector accuracy** — Lower than YuNet. | Score threshold `0.40`, `inputSize` `512`. Could be tuned further. |
| 3 | **Web browser cannot install system software** — The auto-install button cannot run shell commands. | Downloads a script (`.sh` / `.bat`) instead. |
| 4 | **Large image OOM in vectorization** — Very large images can exhaust memory during SVG tracing. | Mitigated by `MAX_VECTORIZE_DIM = 1200` downscaling. |
| 5 | **Video processing is single-threaded** — `MediaRecorder` / `captureStream` approach runs on the main thread. | No Web Worker offloading yet. |
| 6 | **`AbortSignal.timeout` not universally supported** — Some browsers lack it. | Replaced with `AbortController` + `setTimeout` pattern. |

---

## 11. User's Goals & Vision

- **Maximum privacy and anonymity** — the app must be trustworthy.
- **Local-first processing** — prove to users that data stays on their device.
- **Desktop app** for a one-click experience.
- **Simple enough for non-technical users.**
- **Beautiful, modern UI** with good UX.
- **Open-source community project** under Web3Privacy Now.

---

## 12. Conventions & Code Style

| Convention | Detail |
|-----------|--------|
| Single-file React app | `App.tsx` contains everything — UI, state, effects, logic. No child component files. |
| Styling | Inline styles for dynamic / contextual styling; CSS classes for static styles. |
| TypeScript | Strict mode enabled. |
| State management | React hooks only (`useState`, `useRef`, `useCallback`, `useEffect`). No Redux, Zustand, etc. |
| Image processing | Exclusively via the Canvas 2D API. |
| Self-contained | No external API calls, no CDNs, no analytics, no telemetry. |
| Fonts | Self-hosted. Never load from Google Fonts or any CDN. |
| Dependencies | Keep minimal. Every new dependency must justify its bundle size. |

---

## 13. Effect Application Pipeline

1. User opens/selects a photo → image is drawn onto `workCanvasRef` at original resolution.
2. Zones are loaded from `zonesByPhoto` (or detected via the face-detection chain).
3. When the user picks an effect + parameters, the effect function from `effects.ts` is called with the zone bounding box and parameters.
4. The effect mutates the pixel data on `workCanvasRef` **in place** (cumulative).
5. `renderCanvas()` composites `workCanvasRef` onto the visible display canvas, then draws zone overlays (selection rectangles, brush strokes).
6. On export, the `workCanvasRef` contents are encoded to the chosen format via `canvas.toBlob` or the custom encoders in `image-encoders.ts`.

---

## 14. Video Processing Pipeline (`video.ts`)

1. Video file is loaded into a `<video>` element.
2. The processor estimates source FPS locally with `requestVideoFrameCallback` where available, falling back to 30 FPS.
3. Phase 1 analyzes the video locally by seeking through every estimated source frame.
4. Face detection runs through the same robust `detectFaces(..., true)` path as photo detection, on a high-resolution analysis canvas.
5. Weak/non-face candidates are filtered by score and face-like geometry before entering the tracker.
6. The tracker smooths face boxes between detections, predicts short-term motion, keeps per-face emoji identity stable, adds larger video-specific safety padding around faces, and writes short pre-roll keyframes so cuts do not expose faces before the next detection timestamp.
7. Phase 1.5 expands the tracked timeline into a per-frame mask map in `video-timeline.worker.ts`, with a main-thread fallback if workers are unavailable. Both paths use a linear keyframe cursor to avoid repeatedly scanning the whole timeline for every frame.
8. Optional manual frame overrides can replace exact timeline frames with edited snapshot images.
9. Optional per-time-range manual masks are drawn directly over the video player, stored as normalized zones, and merged into the frame map before rendering.
10. Phase 2 plays the video continuously into a hidden browser `<video>` element and renders from the prepared frame map without running face detection or timeline interpolation inside the realtime recorder loop.
11. When available, the render phase uses a WebCodecs track pipeline: `MediaStreamTrackProcessor` reads source `VideoFrame`s, the canvas draws anonymization, and `MediaStreamTrackGenerator` emits processed frames with deterministic frame-index timestamps.
12. When that WebCodecs render path is unavailable, the processed canvas is captured with manual `requestFrame()` pacing where supported, so the encoder receives each frame after anonymization drawing completes.
13. The original audio track is muxed back in from the source video `captureStream()`.
14. `MediaRecorder` encodes the combined stream into a video blob in the best browser-supported container/codec for the selected export format; it remains responsible for muxing audio with both render paths.
15. WebM outputs are repaired after `MediaRecorder` so the preview timeline remains seekable across the full video.
16. The processed blob replaces the selected video in-app and can then be exported.
17. `getVideoPipelineCapabilities()` reports worker, manual frame pacing, OffscreenCanvas, and WebCodecs render availability so future encoders can be added without changing the UI contract.
18. The video UI exposes one-frame stepping plus an `Apply Changes` action for baking frame snapshots and timeline masks into a new render.
19. **Important**: Video processing receives the current app privacy mode. Local mode forces `_forceLocal = true`; Server mode leaves backend detection available, but rendering, timeline expansion, and encoding still happen in the browser.

---

## 15. SVG Vectorization Pipeline (`vectorize.ts`)

1. The current `workCanvasRef` image is captured.
2. If either dimension exceeds `MAX_VECTORIZE_DIM` (1200 px), the image is downscaled proportionally.
3. `imagetracer.js` traces the bitmap into SVG path data using the selected preset or custom parameters.
4. Parameters include: number of colors, color quantization cycles, blur radius, stroke width, line threshold, quad threshold, path omit threshold, corner threshold, and more.
5. 8 built-in presets: Default, Posterized 1–3, Curvy, Sharp, Detailed, Smoothed.
6. The resulting SVG string is displayed in a live preview and can be exported.

---

## 16. Batch Processing

1. User selects multiple photos in the explorer (multi-select via Shift/Ctrl click).
2. Opens the batch panel in the right sidebar.
3. Available batch operations: resize, crop, format conversion, color grading, transform effects, auto-anonymize (face detect + effect).
4. Each photo is processed sequentially with progress indication.
5. Results are exported as a ZIP archive containing all processed images.

---

## 17. Electron Desktop Integration

### IPC API (`window.electronBackend`)

| Method | Purpose |
|--------|---------|
| `isElectron()` | Returns `true` when running inside Electron. |
| `checkPython()` | Checks if Python 3 is available on the system. |
| `installDeps()` | Runs `pip install` for the server requirements. |
| `startServer()` | Spawns the FastAPI server as a child process. |

### Build Targets

- **macOS**: `.dmg` via `electron-builder`. Script: `npm run desktop:mac`.
- **Windows**: `.exe` (NSIS installer) via `electron-builder`. Script: `npm run desktop:win`.
- **Linux**: `.AppImage` via `electron-builder`. Script: `npm run desktop:linux`.

### CI/CD

- `.github/workflows/build-desktop.yml` triggers on tag push.
- Builds for all three platforms.
- Uploads artifacts to GitHub Releases.

---

## 18. Privacy & Security Design

| Aspect | Implementation |
|--------|---------------|
| No network calls | The app makes zero outbound requests (unless Server mode is explicitly enabled, and even then only to `127.0.0.1`). |
| No CDNs | All fonts, icons, and libraries are bundled or self-hosted. |
| No analytics | Zero tracking, telemetry, or fingerprinting. |
| CSP-ready | The app is designed to work under a strict Content Security Policy. |
| CPU timing proof | During face detection, the UI shows a CPU timing indicator to prove processing is happening locally. |
| `localStorage` only | User preferences (theme, local/server toggle) are stored in `localStorage`. No cookies. |

---

## 19. Python Backend API Reference (`server/main.py`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/status` | GET | Health check. Returns `{ "status": "ok" }`. |
| `/api/detect` | POST | Accepts an image (multipart), returns array of face bounding boxes `[{x, y, w, h}]`. Uses OpenCV YuNet. |
| `/api/deps` | GET | Returns installed Python package versions for the deps dialog. |
| `/api/install` | POST | Triggers `pip install` of required dependencies. |

Server binds to `127.0.0.1:7865` (localhost only — never exposed to the network).

---

## 20. Quick-Start for New Agents

```bash
# 1. Install dependencies
cd /Users/lubos.kral/Desktop/ANONYMIZER
npm install

# 2. Start dev server
npm run dev
# → opens at http://localhost:5173

# 3. (Optional) Start Python backend
cd server
pip install -r requirements.txt
python main.py
# → runs at http://127.0.0.1:7865

# 4. Build for production
npm run build

# 5. Build desktop app (macOS example)
npm run desktop:mac
```

---

## 21. Key Codebase Navigation Tips

- **To find any UI element**: Search `App.tsx` — every button, dialog, and panel is defined there.
- **To modify an effect**: Edit `src/lib/effects.ts`. Each effect is a standalone function that receives a canvas context, bounding box, and parameters.
- **To add a new export format**: Add an encoder to `src/lib/image-encoders.ts`, register the MIME type in `src/types.ts` (`NormalizeFormat`), and wire it into the export logic in `App.tsx`.
- **To change face detection behavior**: Edit `src/lib/detector.ts`. The priority chain and thresholds are defined there.
- **To modify the welcome screen or about dialog**: Search for `welcome` or `about` in `App.tsx`.
- **To adjust theme colors**: Edit CSS variables in `App.css` under `:root` (dark) and `[data-theme="light"]` (light).

---

## 22. Latest Changes (Session 2026-05-04)

### Face Detection Fixes
- **face-api.js is now the universal fallback** — previously, if the backend was selected but failed, face-api.js would NOT run. Now it always runs as the last resort regardless of mode.
- **Lowered score threshold** from 0.40 to 0.30 for better recall (catches more faces at the cost of occasional false positives).
- **Increased input size** from 512 to 608 for better accuracy on larger images.

### Button Color States
The face detection tool button now has three visual states:
- **Green** (default `active` style) — Python backend connected, detection working at full accuracy.
- **Orange** (`ts-btn-setup` class) — Backend not connected, using local browser AI. Detection works but at lower accuracy. This is an optimization hint, not a blocker.
- **Red** (`ts-btn-fail` class) — Detection ran but found zero faces. Indicates a problem with the image or detection parameters.

### Deps Dialog (DepsModal) Improvements
- Added **downloadable install script** approach for web users (`.sh` / `.bat`)
- **"View full script source"** toggle shows the entire script before download
- Electron desktop app has **true one-click install** via IPC (checkPython → installDeps → startServer)
- Dialog explains **why** the Python backend is recommended (accuracy), **what** gets installed (with PyPI links), and **where** it runs (localhost only)

### Electron IPC for Backend Management
- `electron/preload.cjs` — Secure context bridge exposing `window.electronBackend`
- `electron/main.cjs` — IPC handlers: `backend:check-python`, `backend:install-deps`, `backend:start-server`
- Uses `contextIsolation: true` + `contextBridge` (Electron security best practice)
- Backend child process is killed on app quit

---

*Last updated: 2026-05-04*
