# Control typography and media placeholders

The existing layout and visual identity are preserved. Controls share an 11 px type size, readouts and secondary labels use 10 px, readable content uses 13 px and panel headings use 16 px. Editorial headings and brand graphics retain their own scale.

- Smaller, uncondensed button labels and quieter letter spacing reduce crowding without shrinking touch targets.
- Percentage, negative and frequency readouts use tabular numerals. Longer values widen the slider handle; the invisible native thumb matches it, keeping the label aligned at either end.
- Audio, TXT and PDF have separate local SVG thumbnails in desktop/mobile grid and list views. Non-image files are no longer loaded as image previews on mobile. No icon font or remote assets are needed.
- Long audio preset names wrap on narrow screens. Audio settings retain horizontal sliders and category controls in landscape; the photo/video side rail keeps its vertical layout.

## Backup

Original changed files are in `backups/20260929-typography/`. The complete earlier backup in `backups/20260929T203320Z` and VPS release `20260929T213455Z` are preserved.

## Verification

`npm run lint` and `npm run build` pass. Production smoke checks pass (69). `scripts/ui-polish-e2e.mjs` passes at nine viewports from 320×568 to 1920×1080, including menus, panels, video actions and Color Shift. `scripts/typography-e2e.mjs` verifies button typography, actual text bounds inside slider handles, extreme signed percentages/frequency values, keyboard changes, all three media placeholder kinds in grid/list views, readable document body text and audio control visibility.

Images before and after are in sibling folders; production/public measurements and deployment identity are recorded alongside this file.

Public verification also passes at all nine viewports (126 measured states, including 297 visible slider readouts). Release `20260929T222000Z` is active, with `index-BIIzRr46.js` and `index-CdK_3SMI.css`; previous release `20260929T213455Z` is retained.
