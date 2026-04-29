#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# Anonymizer – start both backend and frontend
# ──────────────────────────────────────────────────────────────
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 1. Python backend ─────────────────────────────────────────
PYTHON="${PYTHON:-python3}"

echo "📦 Installing / verifying Python dependencies…"
$PYTHON -m pip install -q -r "$ROOT/server/requirements.txt"

echo "🚀 Starting Python detection backend on http://127.0.0.1:7865"
cd "$ROOT/server"
$PYTHON -m uvicorn main:app --host 127.0.0.1 --port 7865 --log-level info &
BACKEND_PID=$!

cd "$ROOT"

# ── 2. Vite frontend ──────────────────────────────────────────
echo "🌐 Starting Vite dev server…"
npm run dev &
FRONTEND_PID=$!

# ── 3. Cleanup on exit ────────────────────────────────────────
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

wait
