# Effect preview performance repair

The photo effect strength slider previously decoded the original image and
created GPU textures for every update. Its debounce added 90–120 ms before
rendering. Applying detected zones also yielded a full animation frame for
every face, making a dense crowd unnecessarily slow.

The active photo now retains one decoded original and one reusable staging
canvas. Updates start on the next animation frame, yield after an 8 ms work
budget, and discard superseded renders before publishing any pixels. Switching
photos releases the preview resources. GPU programs reuse two textures and
cached uniform locations. Small pixelization regions use direct block-center
sampling; larger regions retain the GPU path. Drawing the sampled region back
through the canvas preserves clipping and compositing.

Status messages use the existing theme colors, an 11 px font, compact padding,
and a green status icon with a small dismiss button.

## Verification

- Lint and production build passed; 252 unit tests passed in 36 files.
- Release smoke: 69 checks passed, including mobile and desktop layouts.
- Privacy browser integration: all 11 tested effects changed their regions
  without modifying pixels outside the mask; video/audio export and cleanup
  checks passed.
- Slider browser test: the crowd demo with 460 detected faces rendered isolated
  pixelization changes in 24–43 ms in a local headless Chromium run. Subsequent
  slider changes required no image decoding or GPU texture creation. This is a
  local measurement, not a guarantee for every device.
- Rapid reversals ended at the same pixels as isolated renders for pixelization,
  blur, zoom blur, noise and glitch; the intentionally randomized Color Ball
  effect settled after the final input.
- CPU/GPU pixelization comparison: opaque images matched exactly across 15
  size/block combinations. Transparent images differed by at most 2/255 per
  channel, within canvas alpha rounding. Circular clipping was preserved.

Regression scripts: `scripts/effect-slider-e2e.mjs` (production UI),
`scripts/pixelate-parity-e2e.mjs` (development server).

## Deployment

Published to https://anonymizer.promptstudio3000.com/ as VPS release
`20260929T202754Z`, main asset `index-BdFT5Gi7.js`. Previous release
`20260928T234510Z` remains available for rollback. Upload checksum was verified
before activation and Caddy remained active.

The same slider test passed against the public deployment: 460 detected faces,
pixelization render times 21.5–35.4 ms, no additional decodes/textures per input,
all rapid reversal checks passed, compact green status icon confirmed, and no
browser runtime errors.
