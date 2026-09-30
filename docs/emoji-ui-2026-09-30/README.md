# Emoji and control refinements — 2026-09-30

The user requested emoji without any added solid background. Removed the backing from photo zones, brush stamps and brush previews. The curated pool now has 25 filled, compact heads; outlined, tapered, fragmented, full-body and hat-heavy forms are excluded. Visible glyph bounds determine centering, and size works consistently in photo and video paths. Emoji follows the platform font and the user's size setting; it is not equivalent to an opaque rectangular redaction.

The effect toolbar shows the currently selected effect on desktop and mobile. Effect tiles center their icon/text and share green fill without an accent outline with Brush/Zone choices. Emoji, presets and segmented tool choices use the same selected treatment. Detection-box controls use the same 13 px type as detection layers, and All classes has 16 px right padding. Adjust/Distort action buttons share geometry and typography; Adjust Reset/Apply sit together in one row.

Verification:
- 252 unit tests; lint and production build.
- `scripts/emoji-shapes-e2e.mjs`: all 25 glyphs have an opaque central face core in this browser at default strength, no added backing in photo/brush/video, stable seeded selection, preview present without backing. Actual glyph sheet: `emoji-contact-sheet.png`.
- `scripts/opaque-masks-e2e.mjs`: 15 source independence, clipping, brush and video checks for Prism. Previous emoji backing checks are intentionally replaced by glyph-shape tests.
- `scripts/control-elements-e2e.mjs`: viewport checks for icon updates, centered effect tiles, action sizes, detection typography, class padding, slider handles, selection and keyboard interaction.
- `scripts/brush-startup-e2e.mjs`: all 11 effects retain first stroke across delayed previews, Undo works; mobile first Tools visit and header notices verified.

Source backup: `backups/20260930-emoji-ui/source-before.tar.gz`. Deployment retains the previous VPS release for rollback.

Deployed release: `20260929T232239Z`, previous release `20260929T224605Z`. Public mobile (390×844) and desktop (1440×900) UI checks passed after deployment. Final desktop centering and the Adjust action row were rechecked at 320, 390, 1025 and 1440 px; tablet/landscape checks also passed during the preceding viewport run. Exact Brush/Zone and Effects selected colors are recorded in `selected-state-check.json`.
