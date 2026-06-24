# Dependencies and integrated runtimes

This document is the dependency inventory for W3PN Anonymizer. The public app is a Vite/React static application; media and document content is processed locally in the browser. The feedback collector is the only production server endpoint and never receives media.

## Runtime packages

| Package | Integration |
|---|---|
| `react`, `react-dom` | Application UI, desktop/mobile shells, dialogs, and local editor state |
| `onnxruntime-web` | WebAssembly inference for YuNet and optional YOLO ONNX models |
| `tesseract.js` | Opt-in English/Czech OCR with word bounding boxes for sensitive-text detection |
| `pdfjs-dist` | Local PDF parsing, text extraction, page rendering, and worker runtime |
| `jspdf` | Flattened redacted PDF generation |
| `jszip` | Batch image ZIPs and rendered PDF-page ZIPs |
| `file-saver` | Explicit browser download/save actions |
| `pica` | High-quality image resizing |
| `browser-image-compression` | Optional browser-side image compression path |
| `imagetracerjs` | Raster-to-SVG vectorization |
| `smartcrop` | Content-aware crop suggestions |
| `@9am/img-halftone` | Halftone transform support |
| `mp4-muxer`, `webm-muxer`, `webm-duration-fix` | Browser-side video container output and WebM duration repair |
| `@fontsource-variable/archivo` | Bundled Archivo variable UI font |
| `@capacitor/core`, `@capacitor/ios`, `@capacitor/android` | iOS/Android WebView wrappers and native project bridge |

The `protobufjs` override pins the transitive protobuf runtime used by model tooling to the audited 7.x line.

## Browser and platform APIs

- Canvas 2D and WebGL render anonymization, color adjustment, distort effects, previews, and exports.
- WebAssembly runs ONNX Runtime, Tesseract OCR, and PDF worker code.
- Web Workers keep PDF parsing, vectorization, and video timeline work off the main thread where supported.
- Web Audio API and AudioWorklets power audio preview/export and live voice masking.
- `MediaDevices.getUserMedia`, `MediaRecorder`, and media streams power live camera/microphone capture.
- File System Access API is optional and used only after explicit user action; standard file input/download flows remain available.
- Object URLs hold session previews and are revoked when items are removed or the app closes.
- Indexed media is not persisted; `localStorage` contains UI/privacy preferences only.

## Models and self-hosted assets

| Asset | Purpose | Loading policy |
|---|---|---|
| `public/models/face_detection_yunet_2023mar.onnx` | Default face detector | Initial privacy-engine load |
| `public/models/privacy/yolo-coco.onnx` | People and selected COCO/raw classes | On demand |
| `public/models/privacy/yolo-license-plate.onnx` | License plates / SPZ | On demand |
| `public/models/privacy/yolo-privacy-custom.onnx` | Documents, screens, signs, tattoos | On demand |
| `public/onnx/*` | ONNX Runtime Web WASM binaries | Same-origin runtime load |
| `public/tesseract/*` | Tesseract worker, SIMD/non-SIMD LSTM cores | On demand |
| `public/tesseract/lang/{eng,ces}.traineddata` | English and Czech OCR data | On demand |
| `public/worklets/*` | Level meter, noise gate, voice mask processors | When audio/live features are used |
| `public/custom-images/*` | UI Faces, Abstract, CryptoPunks, Aavegotchi, Celebrities | Selected library only |
| `public/fonts/*`, `public/brand/*`, `public/demo/*` | UI font/icons, brand assets, opt-in demo media | Same origin |

Optional models are loaded only after their detection target is enabled. Missing optional files degrade that target without disabling face-only use.

## Development and release tooling

| Package | Purpose |
|---|---|
| `typescript`, `vite`, `@vitejs/plugin-react` | Type checking, development server, and production bundle |
| `vitest` | Unit and integration tests |
| `playwright` | Browser smoke, editor, GL parity, vectorize, and visual checks |
| `eslint`, `@typescript-eslint/*`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` | Static analysis |
| `sharp`, `@resvg/resvg-js` | Asset normalization, rasterization, icon generation, and release scripts |
| `electron`, `electron-builder` | Optional macOS/Windows/Linux desktop packaging |
| `@capacitor/cli` | Capacitor runtime/template dependency; local native sync is handled by `scripts/sync-native-capacitor.mjs` |
| `fs-extra` | Build/release filesystem scripts |
| `@types/*` | TypeScript declarations for React and selected libraries |

## Optional feedback service

`server/feedback_main.py` is a small FastAPI service behind the same nginx host:

- `POST /api/feedback` accepts anonymous subject/message/UI metadata only.
- `GET /feedback` is protected with HTTP Basic Auth.
- JSONL storage, request-size limits, input cleanup, and an in-memory rate limit are built in.
- Runtime Python dependencies are `fastapi` and `uvicorn`; no media is sent to this service.

The older localhost detection backend is not part of the public web path. Browser YuNet/YOLO/OCR is authoritative.

## Native wrappers

- Electron packages the already-built `dist/` assets and is currently a source-build option, not a promoted download.
- Capacitor copies the same static build into the iOS and Android projects. The copied `dist/` contains bundled models, ONNX WASM, OCR data, audio worklets, custom images, and demos for offline use after install.
- A free Apple ID can run a development iPhone build from Xcode; App Store/TestFlight distribution requires the paid Apple Developer Program. Android debug APKs can be built from Android Studio or `npm run android:debug` when the Android SDK is installed.

## Updating dependencies

1. Update `package.json` and the lockfile together.
2. Run `npm test`, `npm run build`, and the relevant smoke scripts.
3. Verify COOP/COEP/CORP, CSP, model MIME types, workers, OCR, audio, and video exports on the deployment target.
4. Update this inventory whenever a runtime, model, worker, wrapper, or server integration changes.
