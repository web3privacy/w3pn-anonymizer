# Runtime, Privacy, and Deployment Notes

This project now uses a single face detector everywhere: **YuNet**.

- `Local` mode runs YuNet inside the browser with `onnxruntime-web`.
- `Server` mode runs the same YuNet weights on the user's own localhost Python backend with OpenCV `FaceDetectorYN`.
- Video rendering and export always stay in the browser. In Server mode, only sampled detection frames may be sent to `127.0.0.1:7865`.

## Browser runtime

The frontend depends on these local assets:

- `public/models/face_detection_yunet_2023mar.onnx`
- `public/onnx/*`
- `public/fonts/*`
- `public/vendor/browser-image-compression.js`
- `public/vendor/imagetracer_v1.2.6.js`

For correct browser-side YuNet execution in production:

- serve `.mjs` files as `application/javascript`
- send `Cross-Origin-Opener-Policy: same-origin`
- send `Cross-Origin-Embedder-Policy: require-corp`
- send `Cross-Origin-Resource-Policy: same-origin`
- apply the same resource policy to `/onnx/*` and `/models/*`

If these headers or MIME types are wrong, browser-side ONNX Runtime may fail to initialize.

The optional localhost backend keeps only these runtime artifacts on disk:

- `server/.venv/`
- `server/models/face_detection_yunet_2023mar.onnx`

## Data lifecycle and anonymization path

### Local mode

1. The browser reads the source file into a `Blob`.
2. The app creates a preview `ObjectURL` for the session UI.
3. YuNet runs in-browser through `onnxruntime-web`.
4. The app stores only face boxes, zones, temporary canvases, and edit state in memory.
5. Anonymized output is rendered in-browser and written to disk only when the user explicitly exports or overwrites.

### Server mode

1. The browser still owns the source file and render pipeline.
2. Only detection requests are sent to `127.0.0.1:7865`.
3. The backend validates content type, magic bytes, upload size, and decoded pixel count.
4. OpenCV YuNet returns only bounding boxes.
5. The backend releases upload bytes and decoded arrays immediately after detection.
6. The browser applies anonymization effects and performs final export locally.

### Video path

1. The source video remains a browser `Blob`.
2. The app samples detection frames across the timeline.
3. Detection uses the selected mode:
   - `Local`: sampled frames stay in-browser
   - `Server`: sampled frames may be sent to localhost for bounding boxes
4. Timeline interpolation, mask expansion, manual frame overrides, preview rendering, and final encoding always stay in-browser.
5. The final output is saved only on explicit export.

### What stays in memory

During a normal session, the app keeps these items only in browser memory:

- loaded image/video `Blob`s
- preview `ObjectURL`s
- original backups used for reset
- anonymization zones and masks
- saved snapshots
- temporary video frame overrides
- generated preview canvases and worker state

### What is persisted

The app writes only two preferences to `localStorage`:

- `anonymizer-theme`
- `anonymizer-processing-local`

No image or video content is persisted to browser storage by default.

### What gets written to disk

Files are written only when the user explicitly does one of these actions:

- exports an image, SVG, ZIP, or video
- saves a processed file through the browser/desktop download flow
- enables overwrite mode for batch processing with File System Access

### Cleanup behavior

- preview `ObjectURL`s are revoked when media is replaced or deleted
- remaining previews are revoked when the app unmounts
- the Python backend deletes upload bytes and decoded arrays after each detection request

## Local vs Server mode

### Local mode

- Input pixels never leave the browser.
- YuNet runs on the full image plus tiled crops for larger frames.
- Video detection uses sampled frames downscaled to at most `1280px` on the long edge.

### Server mode

- The browser sends only detection requests to `127.0.0.1:7865`.
- The backend accepts JPEG, PNG, WebP, BMP, and TIFF requests up to `25 MB` and `30 MP`.
- The backend returns only bounding boxes.
- Rendering, masking, timeline interpolation, and final encoding still happen client-side.

## Operational limits

- browser queue limit: `2000` media items
- image input limit: `50 MB` per file
- video input limit: `500 MB` per file
- video export bitrate: `6 Mbps` video + `128 kbps` audio
- default FPS when metadata is unavailable: `30`
- normalized FPS operating range: `10-60`
- batch resize controls clamp width/height to `25000`
- SVG preview caps the long edge at `1200px`

## Recommended deployment profile

### Public deployment

Recommended default:

- deploy only the static frontend
- keep detection in `Local` mode
- do not expose the Python backend publicly

This preserves the strongest privacy story because all pixels stay on the user's device.

### Trusted-host / kiosk / internal deployment

If you need the Python YuNet backend:

- bind it to `127.0.0.1:7865` only
- reverse proxy `/api/*` on the same host if needed
- do not log request bodies
- do not persist uploaded frames to disk
- do not expose the backend directly to the public internet
- keep the writable runtime paths local:
  - `server/.venv/`
  - `server/models/face_detection_yunet_2023mar.onnx`
- keep CORS scoped to localhost or the exact same-host frontend origin

## Server scripts

Canonical scripts:

- `./server/install.sh`
- `./server/start.sh`
- `./server/install.bat`
- `./server/start.bat`
- `./start.sh` for combined frontend + localhost backend startup on macOS/Linux
