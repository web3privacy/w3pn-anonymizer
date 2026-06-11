# Self-hosted Tesseract OCR assets

These files power **on-device sensitive-text (PII) detection** on photos. Everything
is served from the same origin — no CDN, no upload. The detector (`src/lib/detectors/ocrPiiDetector.ts`)
creates the Tesseract worker with `workerPath`, `corePath`, and `langPath` pointing here.

| File | Purpose |
|------|---------|
| `worker.min.js` | Tesseract.js worker script |
| `tesseract-core-simd-lstm.wasm[.js]` | LSTM OCR engine (SIMD build) |
| `tesseract-core-lstm.wasm[.js]` | LSTM OCR engine (non-SIMD fallback) |
| `lang/eng.traineddata` | English language data (`tessdata_fast`) |
| `lang/ces.traineddata` | Czech language data (`tessdata_fast`) |

The worker runs in OEM mode 1 (LSTM only), so only the `-lstm` cores are vendored.

## Regenerating

```bash
# Engine + worker (from the installed npm packages)
cp node_modules/tesseract.js/dist/worker.min.js public/tesseract/
cp node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm{,.js} public/tesseract/
cp node_modules/tesseract.js-core/tesseract-core-lstm.wasm{,.js} public/tesseract/

# Language data (uncompressed; the worker is configured with gzip: false)
curl -sL -o public/tesseract/lang/eng.traineddata \
  https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata
curl -sL -o public/tesseract/lang/ces.traineddata \
  https://github.com/tesseract-ocr/tessdata_fast/raw/main/ces.traineddata
```

All OCR runs locally in the browser. No cloud APIs.
