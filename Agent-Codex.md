# W3PN Anonymizer — maintenance guide

Updated after the 2026-09-29 video changes. Read `docs/VIDEO-PROCESSING-2026-09-29.md` and `docs/REPAIRS-2026-09-28.md` for verified behavior and remaining work. The older audit is a snapshot of the input code, not a description of the repaired version.

## Architecture

React 18 / TypeScript / Vite; local Canvas/Web Audio processing, optional local YuNet/YOLO ONNX models and Tesseract OCR. This checkout has no active Python/FastAPI backend. Do not add network media uploads as a fallback.

- `src/App.tsx`: application state and existing desktop/mobile editor UX. Async compression previews carry a generation and photo identity; manual edits invalidate pending quality/zone previews. Mobile Tools entry activates the displayed tool. Status notices live inside headers and dismiss after 2 seconds; see `docs/brush-startup-2026-09-29/README.md`.
- `src/ui-system.css`: shared control typography, spacing and opaque surfaces; `src/about-page.css` and `MobileAbout` explain the workflow with a lightweight, reduced-motion-aware illustration. `ToolFlyout` bounds desktop panels to the viewport. See `docs/ui-ux-2026-09-29/README.md` and preserve the pre-change backup in `backups/20260929T203320Z`.
- Controls use 11 px type, readouts/secondary labels 10 px, body text 13 px and panel headings 16 px. `RangeWithThumb` widens long readouts and their native thumb together. `MediaPlaceholder` supplies local SVG audio/TXT/PDF thumbnails in both library layouts. Audio sliders and categories remain horizontal in landscape. See `docs/typography-2026-09-29/README.md` and `scripts/typography-e2e.mjs`.
- Handles stay white, with green progress. `SelectionMark` is shared between desktop/mobile. Effect toolbar icons reflect the selected effect via `EFFECT_ICONS`. Photo toolbar labels are BRUSH (effect strength) and SIZE (stroke radius); effect sheets keep three columns. `scripts/control-elements-e2e.mjs` verifies nine viewports, real text bounds, selection and keyboard behavior.
- At the user's request, `Prism` refracts the actual source image into scrambled, mirrored triangular fragments. Strength reduces source sampling (12→4 samples per axis) and enlarges facets (7→3 cells per axis). A 32-entry geometry-only coordinate cache (1 MiB) and two reused ≤12²/64² scratch canvases bound memory; source pixels refresh every frame and buffers are cleared after compositing. Small face patches use ≤256 KiB reads; large regions downsample into tiny scratch storage instead of copying the full selection. Track identity keeps geometry stable in video. The brush core is opaque, with a half-pixel edge. This source-derived distortion is not the previous source-independent opaque replacement. See `docs/prism-source-2026-09-30` and `scripts/opaque-masks-e2e.mjs`.
- At the user's request, emoji has no added backing. Its 25-item pool contains filled compact heads; exclude outlined, tapered or fragmented shapes. Photo, brush, preview and video center the visible glyph consistently. Glyph coverage depends on size and the platform's emoji font; it is not a full opaque rectangular mask. Keep historical evidence in `docs/controls-2026-09-30` as a snapshot of the earlier backed version. Updated checks are in `docs/emoji-ui-2026-09-30`.
- `src/hooks/useDetector.ts`: on-demand face initialization, single in-flight attempt, no polling on the home screen.
- `src/lib/yunet-wasm.ts`: dynamically imported WASM-only ONNX runtime; serialized inference.
- `src/lib/detectors/`: YOLO, OCR and detection geometry. Errors must remain distinguishable from zero detections.
- `src/lib/video.ts`: sampled analysis, conservative target tracking, sparse timeline lookup, explicit sampling of each output frame, bounded encoder queues; WebCodecs and disk-backed MediaRecorder fallback.
- `src/lib/video-storage.ts` and its worker: private temporary OPFS files, serialized positional writes, explicit Blob ownership/release and abandoned-session cleanup.
- `src/lib/video-analysis.ts` and `VideoAnalysisPanel`: selectable sampling, cumulative offset passes and review intervals.
- `src/lib/video-timeline-core.ts`: conservative automatic masks; explicit manual keyframes retain interpolation.
- `public/audio/`: small local AudioWorklets for video pitch effects and bounded PCM transport.
- `src/lib/native-media-library.ts`: common export interface; 256 KiB native bridge chunks, native temporary files and OS sharing. No whole-video base64 payloads.
- Android and iOS wrappers: `android/`, `ios/`; GrapheneOS uses the Android build and must be tested without Play services.
- iOS uses a single UIKit scene (`UIApplicationSceneManifest`, `SceneDelegate` in `AppDelegate.swift`) with the existing Main storyboard. iOS 27 rejects the legacy app-only lifecycle at launch. A successful `simctl launch` response alone does not prove the app remains open; check process survival and an actual rendered screen after repeated cold launches. See `docs/ios-startup-2026-09-30/`.
- `electron/main.cjs`: restricted local `anonymizer://app` protocol serves assets from dist.

## Privacy and resources

Preserve manually drawn, user-modified and locked masks. A crop must transform mask coordinates and original detection coordinates. Merging detections must preserve the union of protected pixels. First detections and brief detector dropouts must remain masked. A failed requested detector must not silently export an unprocessed original.

Source media stays in local File/Blob objects; video working data and output use private OPFS files. Masks and small indexes remain in memory. LocalStorage contains preferences, not media. Native exports temporarily use private files; iOS removes files after completion/cancellation, Android retains shared files until the next launch so receiving apps can read their granted URI. Source files must never be written to logs or analytics.

Video defaults to 8 checks/s; users can select 0.25–120 checks/s, every output frame, initial passes and additional passes. Sampling is capped by estimated output FPS. Additional passes fill gaps and reuse detections only for the same source and detector settings. Review markers are heuristic; neither them nor conservative masks prove anonymity. Exact variable-frame-rate source decoding and measured detector recall remain future work.

The previous 160 MiB output, 96 MiB frame cache, 500 MiB input and 10-minute processing caps are removed. Encoded chunks spool to disk, then interleave into a streamed muxer; fallback PNG frames use one indexed temporary file. Keep bounded encoder queues and the 32 MiB pending-write guard. Disk quota, per-frame memory and growing small indexes still matter. Release result ownership when library blobs disappear, preserve it across hot reload, and never delete files belonging to live tabs. Old WebKit uses a SyncAccessHandle worker; without OPFS, fail before expensive analysis with a clear message. Defaults: video 6 Mbps, audio 128 kbps, detection long edge 1280, output FPS fallback 30.

## Verification and builds

- `npm test`, `npm run lint`, `npm run build`.
- Start dev server, then `npm run test:privacy-browser`: synthetic video integration test for real encoding, masking, altered audio, fallback, cancellation, cleanup and no model/WASM home downloads.
- `npm run ios:sync` / `npm run android:sync` prepare only the requested platform; `native:sync` prepares both.
- `npm run native:doctor -- android` / `-- ios` identify missing SDK tooling and return nonzero when incomplete; `-- --json` produces machine-readable evidence. Java 21 and Android SDK 35 are required by the current project. Read `docs/MOBILE-RELEASE-PLAN-2026-09-30.md` for native preparation and device acceptance tests. Asset sync alone is not native build verification. Actual devices remain mandatory before mobile release.
- Native toolchain preparation also checks Gradle 8.11.1 runtime compatibility (Java 21–23); Android Studio's JBR 25 runs the IDE but must not run this Gradle. Project-local `.gradle/config.properties` and `.idea/gradle.xml` select Temurin 21 on this Mac, without absolute paths in shared Gradle properties. The Gradle distribution has its official SHA-256 pinned. Xcode 27 rejects iOS 14 targets; App and its SPM package now target iOS 15.
- PDF export deliberately flattens redacted pages into image-only output; check its API whenever updating jsPDF.
- Avoid claiming complete anonymity from a green library indicator or detection confidence. `privacyProcessed` records a processing action, not proof of anonymity.

Maintain existing visual style and interaction patterns. Keep optional engines and media features off the critical home-screen loading path. Add tests for privacy and lifecycle regressions rather than merely mirroring implementation.
