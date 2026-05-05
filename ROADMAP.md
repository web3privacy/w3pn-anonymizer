# W3PN Anonymizer Roadmap

This is the long-term product roadmap for features we want to implement in later batches.

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
