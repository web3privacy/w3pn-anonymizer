#!/usr/bin/env bash
# Spustí Vite na IPv4 (127.0.0.1) a uvolní port 5173, pokud na něm něco visí.
# Stejné chování aplikace jako `npm run dev` — mění se jen host a úklid portu.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-5173}"
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
  if [[ -n "${PIDS:-}" ]]; then
    echo "Uvolňuji port $PORT (PID: $PIDS)…"
    kill -9 $PIDS 2>/dev/null || true
    sleep 0.5
  fi
fi
exec npx vite --host 127.0.0.1 --port "$PORT" --strictPort
