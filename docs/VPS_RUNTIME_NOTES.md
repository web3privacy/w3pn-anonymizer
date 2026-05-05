# VPS Runtime Notes

## Nginx requirements for browser-side detection

`anonymizer.web3privacy.info` must serve the ONNX Runtime browser assets with
the correct module MIME type and cross-origin isolation headers, otherwise the
local/browser detector silently falls back away from YuNet WASM and detection
becomes both slower and less accurate on crowd photos.

Production nginx should ensure:

- `.mjs` files are served as `application/javascript`
- the document sends:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Resource-Policy: same-origin`
- ONNX / WASM / model assets also send `Cross-Origin-Resource-Policy`

Without this, browser logs show errors similar to:

- `Failed to fetch dynamically imported module: ... ort-wasm-simd-threaded.jsep.mjs`
- `ERR_BLOCKED_BY_RESPONSE`

Symptoms:

- local mode skips YuNet WASM
- local mode falls back to MediaPipe / face-api.js
- first demo image detects far fewer faces than server mode
