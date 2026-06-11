# W3PN Anonymizer Roadmap

This is the long-term product roadmap for features we want to implement in later batches.

## Known limitations & next fixes (June 2026 audit)

A focused bug hunt across the newer subsystems (audio, document/OCR, extended
detection, import/export, live capture) fixed a batch of issues and surfaced the
items below. **Photos and video core editing were unaffected.**

### Fixed in this pass
- **One effect per region** — cross-type de-dup now also drops a generic `object`
  box that is mostly contained inside a featured detection (low IoU, high
  containment), so a region is never redacted twice (`detectorUtils.ts`).
- **Audio ghost noise** — `AudioModeViewer` now tears down its Web Audio graph
  (oscillators, noise source, analyser → destination) on unmount and resets the
  transport when the source changes; `play()` is awaited before flipping to
  "playing".
- **Custom audio intensity** — moving the Intensity slider no longer zeroes a
  user's Advanced (custom-preset) parameters (`audioPresets.ts`).
- **Voice mask** — double-start mutex, recording-URL revoke on teardown, and a
  `MediaRecorder` mime probe (Safari/Firefox safe) (`useVoiceAnonymizer.ts`).
- **Live capture leak** — an in-flight recording is now stopped on unmount
  (`MobileLiveFloatingControls.tsx`).
- **Detection availability** — `screen`/`document` are available if *any* backing
  model (coco **or** custom) is ready; PII-only mode no longer runs face
  detection when Faces is disabled; `pii_text` is no longer mislabeled as an
  ONNX target in the "More privacy targets" sheet.
- **OCR performance** — images are downscaled to ≤2000 px before OCR (normalized
  boxes keep their position) to avoid freezes/OOM on large photos.
- **Classification / detection polish** — `audio/webm` is no longer misrouted to
  the video pipeline; IBAN regex is case-insensitive; tiny labels clamp inside
  the frame; generic-object labels are Title-cased; `showDetectionLabels`
  defaults to on unless explicitly disabled; video track-mode `audio` no longer
  gets stuck in `remove_audio`.
- **DOCX import disabled** — DOCX was parsed as raw text (it is a ZIP), producing
  garbage and a leaky export; it is now rejected until a real parser is wired.

### Highest-priority remaining work
1. **Apply voice distortion on video export.** Preview anonymizes the audio, but
   `processVideo` only honors `remove_audio` — `distort_voice` muxes the raw
   track. Decode → `renderProcessedAudioBuffer` → mux in both the WebCodecs and
   `MediaRecorder` paths (`src/lib/video.ts`, `src/hooks/useVideoController.ts`).
   *Privacy gap.*
2. **Bake in-session redactions into library/batch export.** "Download all" uses
   the raw blob for audio/documents unless the user clicked per-item Export, so a
   library ZIP can ship un-redacted audio/PDF/TXT. Re-run the audio pipeline /
   document redaction (or require commit) inside `exportItemToFile`
   (`usePhotoLibrary.ts`). *Privacy gap.*
3. **OCR for scanned / image-only PDFs.** Document mode uses the pdf.js text
   layer only; scanned pages get zero detections and export unchanged. Reuse
   `detectPiiViaOcr` on each rendered page canvas (or warn/block export when a
   page has no text layer).
4. **Real DOCX support** via `mammoth` (re-enable the import once parsing +
   redacted export are correct).

### Secondary fixes
- **Mobile track-mode parity** — expose the `VideoTrackModeSelect` dropdown +
  embedded audio editor on mobile video (currently desktop-only).
- **Mute editor preview for "Video only"** — bind `muted` on the editor `<video>`
  to `trackMode === 'video'` / `audioSettings.mode === 'remove_audio'`.
- **Document robustness** — merge/dedupe overlapping text spans before export;
  match PII across token boundaries (pdf.js / OCR split `user@`+`domain`);
  blur/pixelate PDF redaction via an offscreen copy instead of a self-blit;
  mask PII in the editor DOM (reveal on hover); release page rasters
  (`URL.createObjectURL`/`revoke` instead of permanent `data:` URLs).
- **OCR worker lifecycle** — call `disposeOcr()` on teardown / extended idle;
  prefetch `worker.min.js` + non-SIMD core fallback; wire `setOcrProgressCallback`
  into the detection progress UI.
- **YOLO decoding hardening** — guard transposed `[1, anchors, 84]` outputs and
  auto-detect pixel-vs-normalized coordinate scale; cache `probeYoloModel*`
  results and add a per-model session mutex to avoid duplicate ORT sessions.
- **Live recorder race** — disable the capture button until `stop()` resolves to
  avoid an empty/stale second capture.
- **Mark live-recorded video as anonymized** (green outline + `-anon` name).
- **Bundle size** — code-split the largest chunks (pdf/jspdf/onnx/html2canvas).

## Next Privacy / Anonymization Upgrades

- OCR redaction for text, handles, emails, wallet addresses, ENS names, and UI labels.
  Candidate: [Tesseract.js](https://github.com/naptha/tesseract.js)
- QR code and barcode detection with one-click masking.
  Candidate: [zxing-js/browser](https://github.com/zxing-js/browser)
- Landmark-aware face masks instead of rectangle-only anonymization.
  Candidate: [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js)
- Person / hair / clothing / full-body segmentation for crowd photos and event footage.
  Candidate: [MediaPipe Image Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter/web_js)
- Click-to-segment masking for arbitrary objects like badges, laptops, tattoos, documents, or screens.
  Candidate: [MediaPipe Interactive Segmenter](https://ai.google.dev/edge/mediapipe/solutions/vision/interactive_segmenter/web_js)
- Additional sensitive-object detection for screens, phones, license plates, and badges.
  Candidate: [Transformers.js](https://github.com/huggingface/transformers.js)

## Future Transform Packs

- Richer GPU transforms such as swirl, bulge/pinch, hex mosaic, tilt-shift, and lens blur.
  Candidate: [glfx.js](https://github.com/evanw/glfx.js)
- More stylized anonymization presets tuned for batch export consistency.
- Reusable transform macros for common publishing styles.

## Video Roadmap

- Implemented foundation: editable frame snapshots can now be attached back to the source video as manual frame overrides for the next render.
- Implemented foundation: lightweight inter-frame face tracking now smooths boxes between detector refreshes and keeps per-face emoji identity stable.
- Implemented foundation: video export now runs as a local two-phase pipeline: detection prepass builds a track timeline, then rendering runs without face detection inside the realtime recorder loop.
- Implemented foundation: a local timeline worker now expands tracked keyframes into per-frame masks before rendering, reducing main-thread work during playback capture.
- Implemented foundation: canvas capture uses manual `requestFrame()` pacing where supported, so encoded frames are requested only after each anonymized frame is drawn.
- Implemented foundation: the video processor now estimates source FPS locally before analysis, instead of assuming every video is 30 FPS.
- Implemented foundation: video detection now respects the app privacy mode, using fully local detection in Local mode and allowing the server detector only when Server mode is selected.
- Implemented foundation: timeline expansion now uses a linear keyframe cursor in both worker and fallback paths, improving long-video preparation cost.
- Implemented foundation: manual per-time-range video masks can be drawn directly over the video and are baked into the frame map on the next render.
- Implemented foundation: video export can use a WebCodecs `MediaStreamTrackProcessor` / `MediaStreamTrackGenerator` render path where supported, while keeping `MediaRecorder` for audio muxing.
- Implemented foundation: video export UI now exposes pipeline capability status for timeline workers, manual frame pacing, and WebCodecs render readiness.
- Implemented hardening: video analysis now uses the same robust face detection path as photos, scans densely at 8 fps, adds pre-roll masks around detections, filters weak non-face candidates, and uses larger face padding.
- Implemented hardening: video analysis now samples every estimated source frame, uses deterministic frame-index timestamps for the WebCodecs render path, repairs WebM duration metadata after `MediaRecorder`, and boosts video anonymization strength for large foreground faces.
- Implemented editing foundation: video preview now exposes one-frame step controls and an `Apply Changes` action for baking frame snapshots and timeline masks back into the rendered video.
- Next: richer keyframed mask editing with movable start/end boxes and a visible timeline lane.
- Next: move detection canvas work deeper into local workers where supported, while keeping all model files and frames on-device.
- Future: desktop-only advanced encoders for formats not reliably supported by browser MediaRecorder.
