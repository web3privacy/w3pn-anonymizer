# Runtime, Privacy, and Deployment Notes

The public web release runs **entirely in the browser**. Faces are detected with **YuNet**, optional objects with **YOLO**, and sensitive text with **on-device OCR (Tesseract.js)** — all via ONNX Runtime Web / WebAssembly. No image, video, audio, or document content is sent to any server.

## Browser runtime

The frontend depends on these same-origin assets:

- `public/models/face_detection_yunet_2023mar.onnx`
- `public/models/privacy/*.onnx` + `*.metadata.json` (optional YOLO models — placed locally; some `.onnx` files are not bundled in git)
- `public/onnx/*` (ORT WASM binaries)
- `public/tesseract/*` (self-hosted OCR LSTM core + `worker.min.js`) and `public/tesseract/lang/{eng,ces}.traineddata`
- `public/worklets/*` (AudioWorklet processors: level meter, noise gate, voice mask)
- `public/fonts/*`
- `public/vendor/browser-image-compression.js`
- `public/vendor/imagetracer_v1.2.6.js`

Heavy optional assets (YOLO ONNX, OCR engine + language data) are **lazy-loaded**: only YuNet initializes for the default face-only flow. A YOLO/OCR group starts loading after the user enables a target that requires it; the shared loader reports the complete download and respects Save-Data / slow connections.

See [Dependencies and integrated runtimes](./DEPENDENCIES.md) for the package, model, worker, browser API, native wrapper, and optional server inventory.

For correct YuNet execution in production:

- serve `.mjs` files as `application/javascript`
- send `Cross-Origin-Opener-Policy: same-origin`
- send `Cross-Origin-Embedder-Policy: require-corp`
- send `Cross-Origin-Resource-Policy: same-origin`
- apply the same resource policy to `/onnx/*` and `/models/*`
- send `Content-Security-Policy` (see `vercel.json`)

If headers or MIME types are wrong, ONNX Runtime may fail to initialize.

## Network activity

At runtime the app makes **no third-party network requests**. All `fetch()` calls are same-origin:

- ONNX model and WASM loaders (YuNet, YOLO)
- Tesseract OCR engine, worker, and language data
- AudioWorklet processor modules
- Custom image preset manifests and assets
- Bundled demo media
- Brand SVG assets
- On-demand cache warming for the explicitly enabled YOLO/OCR group

External links (GitHub, Web3Privacy Now, Donate) open only when the user clicks them. Feedback is posted to the same-origin `/api/feedback` endpoint and contains no media.

## Data lifecycle

1. The browser reads the source file into a `Blob`.
2. A preview `ObjectURL` is created for the session UI.
3. YuNet runs in-browser through `onnxruntime-web`.
4. The app stores face boxes, zones, temporary canvases, and edit state in memory.
5. Output is written to disk only when the user explicitly exports, downloads, or enables batch overwrite via File System Access.

### Video path

1. The source video remains a browser `Blob`.
2. The app samples detection frames across the timeline (in-browser YuNet + optional YOLO when enabled).
3. Timeline interpolation, masking, frame overrides, preview rendering, and final encoding stay in-browser.
4. The final output is saved only on explicit export.

### Audio path

1. Audio files open in **audio mode** (no canvas upload).
2. Preview and export use the Web Audio API locally.
3. Video export can **keep**, **remove**, or **distort** audio (distorted mux is best-effort; WAV export for audio-only).
4. Voice disguise uses DSP (pitch/ring-mod/filters/formant) — not a guaranteed forensic defeat. No speech-to-text or speaker identification.

### Live mode path

1. Camera/microphone streams are obtained via `getUserMedia` and processed in-browser (canvas effects for video, AudioWorklets for the voice mask).
2. Optional monitoring routes masked audio to the speakers; recording captures the **masked** output only.
3. Nothing is uploaded; recordings are saved only on explicit download.

### Document path

1. PDFs are parsed and rendered locally with `pdfjs-dist`; TXT/MD are read as text. DOCX is not yet a supported public import format.
2. PII is detected with regex + checksum recognizers (no model, no OCR upload).
3. PDF and text documents default to blackout; TXT/MD open directly in the anonymized preview. Redaction (blackout/blur/pixelate or token replacement) is applied locally; exports are flattened PDFs, ZIPs of page images, or redacted text.
4. Detected PII strings are kept only in memory and are never embedded in exports or persisted.

### Sensitive-text (OCR) path

1. On still images, Tesseract.js recognizes words + bounding boxes fully in-browser.
2. The recognized text is run through the same PII recognizers; matches become redaction zones.
3. Recognized text and PII are kept in memory only.

### What stays in memory

During a session:

- loaded image/video `Blob`s
- preview `ObjectURL`s
- original backups used for reset
- anonymization zones and masks
- saved snapshots
- temporary video frame overrides
- generated preview canvases and worker state

### What is persisted

| Storage | Key | Data |
|---------|-----|------|
| `localStorage` | `anonymizer-theme` | Theme preference (desktop) |
| `localStorage` | `anonymizer-enable-optical-mode` | Home logo animation toggle |
| `localStorage` | `anonymizer-privacy-settings` | Privacy target toggles, thresholds, label toggle, enabled raw classes, audio effect prefs (no media) |
| `localStorage` | `anonymizer-voice-mask` | Live voice-mask preset/strength prefs (no audio) |
| `sessionStorage` | `anonymizer-live-meta` | Live capture metadata only (no blob) |

No image or video content is persisted to browser storage.

### What gets written to disk

Only on explicit user action:

- export image, SVG, ZIP, or video
- browser download flow
- batch overwrite with File System Access API (opt-in)

### Cleanup behavior

- preview `ObjectURL`s are revoked when media is replaced or deleted
- remaining previews are revoked when the app unmounts
- video/batch operations are aborted on unmount
- live camera stream stops on exit

## Security headers (production)

Mirrored in [`vite.config.ts`](../vite.config.ts) for dev/preview and configured in the production nginx virtual host. [`vercel.json`](../vercel.json) remains a portable static-host header reference, but production does not depend on Vercel:

- COOP / COEP / CORP for WASM isolation
- Content-Security-Policy restricting scripts, connections, and workers to `'self'` (`wasm-unsafe-eval` for ONNX WebAssembly; `unsafe-inline` for boot scripts in `index.html`)

## Operational limits

- browser queue limit: `2000` media items
- image input limit: `50 MB` per file
- video input limit: `500 MB` per file
- audio input limit: `100 MB` per file
- video export bitrate: `6 Mbps` video + `128 kbps` audio
- default FPS when metadata is unavailable: `30`
- normalized FPS operating range: `10-60`
- batch resize controls clamp width/height to `25000`
- SVG preview caps the long edge at `1200px`

## Recommended deployment (public web)

1. Build: `npm run build`
2. Deploy `dist/` to the nginx document root (production: `/opt/w3pn-anonymizer/repo/dist`)
3. Verify ONNX model and WASM files are served from `/models/` and `/onnx/`
4. Verify isolation + CSP headers on all routes
5. Smoke-test face detection on the production URL

## Optional components (not in public web release)

The repository may contain **Electron** desktop packaging and a **Python localhost backend** for future or self-hosted use. These are **not required** for the public web app at [anonymizer.web3privacy.info](https://anonymizer.web3privacy.info). The current web frontend does not send detection requests to any backend.
