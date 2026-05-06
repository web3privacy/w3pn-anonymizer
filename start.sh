#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# W3PN Anonymizer — start frontend + localhost YuNet backend
# ──────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER_DIR="$ROOT/server"

if [ ! -d "$ROOT/node_modules" ]; then
  echo "📦 Installing frontend dependencies…"
  npm install
fi

echo "🚀 Starting localhost YuNet backend on http://127.0.0.1:7865"
bash "$SERVER_DIR/start.sh" &
BACKEND_PID=$!

echo "🌐 Starting Vite dev server on http://127.0.0.1:5173"
cd "$ROOT"
npm run dev &
FRONTEND_PID=$!

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' EXIT
wait
