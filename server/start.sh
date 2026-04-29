#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# ANONYMIZER — Start Python backend server  (macOS / Linux)
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"

if [ ! -d "$VENV_DIR" ]; then
  echo "⚠   Virtual environment not found — running install first …"
  bash "$SCRIPT_DIR/install.sh"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

echo "→  Starting ANONYMIZER backend on http://127.0.0.1:7865 …"
cd "$SCRIPT_DIR"
exec python main.py
