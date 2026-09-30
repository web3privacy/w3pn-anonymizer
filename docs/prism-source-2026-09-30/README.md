# Prism from source imagery — 2026-09-30

At the user's request, Prism now uses the actual picture under a brush/zone. It downsamples the source, then refracts its fragments into mirrored, relocated triangular facets. The output retains the source palette and changes with each new video frame. Strength reduces sampling from 12 to 4 per axis and increases facet size (7 to 3 grid cells per axis). The UI calls this control Refraction.

Photo rectangles, brush stamps/previews and video zones share the renderer. Track identity stabilizes geometry without caching media. The protected brush core remains opaque; a half-pixel edge provides antialiasing. Source-derived distortion is not equivalent to the previous source-independent replacement and does not establish anonymity.

Performance and memory:
- Cache only coordinate maps, at most 32 × 64² × two floats = 1 MiB.
- Adaptive output raster: 16² for small faces, 32² for medium faces, 64² for larger selections.
- Small selections read only their own pixels, with at most 256 KiB of temporary patch data. Larger selections downsample directly into the tiny source canvas instead of creating an unbounded full-resolution image copy.
- Reuse two scratch canvases; clear transient pixels after compositing. Source data refreshes on each call.
- Local Chromium synthetic benchmark, 100 regions of 80×70: approximately 13–16 ms for the Prism render loop, excluding detection and complete editor/UI drawing. This is a local measurement, not a cross-device guarantee.

Verification:
- 252 unit tests, lint and production build.
- `scripts/opaque-masks-e2e.mjs`: 28 checks for palette dependence, no old-photo color leakage, changed fine texture, mask bounds, opaque cores, clipped transparent input, stable geometry, strength changes and matching brush preview/stamp.
- `scripts/brush-startup-e2e.mjs` with `BRUSH_EFFECTS=Prism`: first stroke, delayed preview and Undo; mobile brush startup/header notices also verified.
- `scripts/privacy-e2e.mjs`: real encoding/export and frame rendering, mask clipping, audio processing, cancellation and cleanup.
- `prism-comparison.png`: bundled crowd photo before/after at 10%, 40%, 100%.

Backup before changes: `backups/20260930-prism-source/source-before.tar.gz`. Earlier release and historical source-independent Prism checks remain in the previous backup/evidence directories.

Deployed release `20260929T233821Z`; previous release `20260929T232239Z` retained. Public mobile (390×844) and desktop (1440×900) control checks passed; public first Prism stroke/Undo and mobile startup/header notice checks passed.
