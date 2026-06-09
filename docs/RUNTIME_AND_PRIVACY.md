# Runtime, Privacy, and Deployment Notes

The public web release runs **entirely in the browser**. Face detection uses **YuNet** via ONNX Runtime Web (WebAssembly). No image or video pixels are sent to any server.

## Browser runtime

The frontend depends on these same-origin assets:

- `public/models/face_detection_yunet_2023mar.onnx`
- `public/onnx/*` (ORT WASM binaries)
- `public/fonts/*`
- `public/vendor/browser-image-compression.js`
- `public/vendor/imagetracer_v1.2.6.js`

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

- ONNX model and WASM loaders
- Custom image preset manifests and assets
- Bundled demo media
- Brand SVG assets

External links (GitHub, Web3Privacy Now, mailto) open only when the user clicks them.

## Data lifecycle

1. The browser reads the source file into a `Blob`.
2. A preview `ObjectURL` is created for the session UI.
3. YuNet runs in-browser through `onnxruntime-web`.
4. The app stores face boxes, zones, temporary canvases, and edit state in memory.
5. Output is written to disk only when the user explicitly exports, downloads, or enables batch overwrite via File System Access.

### Video path

1. The source video remains a browser `Blob`.
2. The app samples detection frames across the timeline (in-browser YuNet).
3. Timeline interpolation, masking, frame overrides, preview rendering, and final encoding stay in-browser.
4. The final output is saved only on explicit export.

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

Configured in [`vercel.json`](../vercel.json) and mirrored in [`vite.config.ts`](../vite.config.ts) for dev/preview:

- COOP / COEP / CORP for WASM isolation
- Content-Security-Policy restricting scripts, connections, and workers to `'self'` (`wasm-unsafe-eval` for ONNX WebAssembly; `unsafe-inline` for boot scripts in `index.html`)

## Operational limits

- browser queue limit: `2000` media items
- image input limit: `50 MB` per file
- video input limit: `500 MB` per file
- video export bitrate: `6 Mbps` video + `128 kbps` audio
- default FPS when metadata is unavailable: `30`
- normalized FPS operating range: `10-60`
- batch resize controls clamp width/height to `25000`
- SVG preview caps the long edge at `1200px`

## Recommended deployment (public web)

1. Build: `npm run build`
2. Deploy `dist/` to static hosting (e.g. Vercel)
3. Verify ONNX model and WASM files are served from `/models/` and `/onnx/`
4. Verify isolation + CSP headers on all routes
5. Smoke-test face detection on the production URL

## Optional components (not in public web release)

The repository may contain **Electron** desktop packaging and a **Python localhost backend** for future or self-hosted use. These are **not required** for the public web app at [anonymizer.web3privacy.info](https://anonymizer.web3privacy.info). The current web frontend does not send detection requests to any backend.
