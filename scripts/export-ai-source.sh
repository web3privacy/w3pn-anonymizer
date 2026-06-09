#!/usr/bin/env bash
# Creates a trimmed source tree for handing off to another AI (no node_modules, no build artifacts, no large models).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$ROOT/ai-source-export/w3pn-anonymizer}"

echo "Exporting cleaned source → $DEST"
rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"

rsync -a \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude 'release/' \
  --exclude 'ai-source-export/' \
  --exclude 'anonymizer-github-ready/' \
  --exclude '.venv/' \
  --exclude 'server/.venv/' \
  --exclude '__pycache__/' \
  --exclude '*.pyc' \
  --exclude '.DS_Store' \
  --exclude '.playwright-cli/' \
  --exclude 'public/onnx/' \
  --exclude 'public/models/' \
  --exclude 'public/demo/' \
  --exclude 'public/og-image.png' \
  --exclude 'server/models/' \
  --exclude '*.wasm' \
  "$ROOT/" "$DEST/"

# Remove empty dirs left by excluded assets
find "$DEST/public" -type d -empty -delete 2>/dev/null || true

cat > "$DEST/AI_HANDOFF.md" <<'EOF'
# W3PN Anonymizer — AI handoff pack

This folder is a **trimmed source export** for continuing development in another AI session.
It contains TypeScript/React source, Python backend source, and config — **not** runnable binaries.

## What is included

| Path | Purpose |
|------|---------|
| `src/` | React app — `App.tsx` is the main monolith; `src/mobile/` is mobile UI (≤1024px) |
| `server/` | Optional localhost YuNet Python backend (`main.py`) |
| `electron/` | Desktop shell (optional) |
| `public/fonts/` | Self-hosted Material Symbols |
| `public/favicon*`, icons | Small static assets |
| Config | `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` |
| Docs | `README.md`, `ROADMAP.md`, `Agent-Codex.md`, `docs/` |

## What is excluded (re-download / npm install)

- `node_modules/` — run `npm install`
- `dist/` — run `npm run build`
- `public/onnx/` (~59 MB) — ONNX Runtime Web WASM; fetched at runtime / bundled by Vite
- `public/models/` — browser YuNet model
- `public/demo/` — demo images
- `server/models/` — Python YuNet `.onnx` — run `./server/install.sh`

## Architecture (mobile-first)

```
App.tsx                    — state, canvas rendering, desktop + mobile bindings
src/mobile/MobileShell.tsx — routes: home / editor / live
src/mobile/bindings.ts     — AppMobileBindings interface (mobile ↔ App contract)
src/mobile/mobile.css      — portrait mobile styles
src/mobile/mobile-landscape.css — landscape overrides (side tool rail)
src/lib/detector.ts        — face detection (WASM + optional backend)
src/lib/live-camera.ts     — live camera filter loop
src/lib/effects.ts         — anonymization effects
```

**Mobile editor layout:** top glass chrome → full-bleed canvas → bottom/side toolbar.
Pinch zoom + rotate on canvas; tool drawers for face/zone/crop/adjust/distort/effects.

**Breakpoint:** `useIsMobile()` at 1024px (`src/mobile/types.ts`).

## Quick start after unpack

```bash
npm install
npm run dev
# optional backend:
./server/install.sh && ./server/start.sh
```

## Recent mobile work (context)

- Glass morphism UI on dark panels (`backdrop-filter`)
- Bottom toolbar shows **selected sub-tool** icon/label per category
- Effect picker in FX drawer applies immediately to zones
- Landscape: tools docked on right edge (`mobile-landscape.css`)
- View transform: pinch scale/rotate + Reset/Back in top bar

## Key files to read first

1. `src/App.tsx` — renderCanvas, mobile bindings, tool handlers
2. `src/mobile/MobileShell.tsx` — shell composition
3. `src/mobile/MobileBottomToolbar.tsx` — bottom tool bar
4. `src/mobile/categoryToolDisplay.ts` — tool icon/label per category
5. `src/types.ts` — shared types
EOF

# File manifest for the receiving AI
{
  echo "# File manifest ($(date -u +%Y-%m-%d))"
  echo
  find "$DEST" -type f ! -name 'AI_HANDOFF.md' ! -name 'FILE_MANIFEST.md' | sed "s|^$DEST/||" | sort
} > "$DEST/FILE_MANIFEST.md"

BYTES="$(du -sk "$DEST" | cut -f1)"
FILES="$(find "$DEST" -type f | wc -l | tr -d ' ')"
echo "Done: $FILES files, ~${BYTES} KB"
echo "Zip: cd $(dirname "$DEST") && zip -r w3pn-anonymizer-ai-source.zip $(basename "$DEST")"
