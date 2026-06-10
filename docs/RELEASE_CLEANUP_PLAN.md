# Release cleanup plan

This checklist keeps the release path focused on `https://anonymizer.web3privacy.info` and avoids broad UI rewrites while the app is already close to shippable.

## Current gates

- Run `npm run release:check` before every release candidate.
- Keep production metadata, `robots.txt`, and `sitemap.xml` pointed at `https://anonymizer.web3privacy.info`.
- Treat any `promptstudio` domain reference outside audit/test guards as a release blocker.
- Keep custom image preset libraries registered in `src/lib/custom-image-presets.ts`; `npm run release:audit` validates registry entries, manifests, PNG existence, and PNG dimensions.

## Next cleanup passes

1. Resolve the `dist/` policy.
   Decide whether releases deploy from a fresh source build or from tracked `dist/` artifacts. Today `release:audit` warns when `dist/index.html` points at ignored untracked build assets, which is safe as a warning but should become a clear policy before tagging a release.

2. Add focused mobile visual smoke tests.
   Capture `390x844`, `395x778`, and `420x778` screenshots for Home, Library, photo editor, video editor, Live, and About. Compare only stable layout invariants such as visible controls, no overlap, full-width separators, and expected mobile shell state.

3. Expand custom image smoke coverage.
   Current smoke verifies that every bundled library manifest and a sample PNG are reachable through `/custom-images/`. Next, add a short UI fixture that opens Custom Image, switches bundled libraries, uploads one generated PNG, and verifies the picker count changes without depending on the full demo/model initialization path.

4. Add photo effect pixel smoke coverage.
   Use a small deterministic canvas fixture to assert that destructive effects change pixels and that Blur, Pixelate, Emoji, Contour, and Custom Image still render through both rectangle and brush paths.

5. Add video editor smoke coverage.
   Load a short local fixture, verify Draw Mask remains video-only, Range controls do not appear in photo editing, and export controls do not overlap at mobile widths.

6. Keep Live Mode permission flow narrow.
   Continue requiring a user gesture before `getUserMedia`, stop streams when leaving Live, and keep camera error copy free of local-development URLs.

7. Audit shared UI changes before touching desktop.
   Mobile polish can share helpers and data registries, but visual CSS changes should stay scoped to mobile classes unless a shared behavior fix is required.

## Known release warning

`npm run release:audit` may warn that `dist/index.html` references ignored untracked `dist/assets/*` files. This is expected until the `dist/` policy is decided; it is not the same as a missing asset failure.
