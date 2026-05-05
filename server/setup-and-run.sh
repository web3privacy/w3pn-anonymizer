#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# W3PN ANONYMIZER — Install dependencies & start Python backend
# 
# This script:
#   1. Checks that Python 3.9+ is installed
#   2. Creates a virtual environment in ./server/.venv
#   3. Installs packages: fastapi, uvicorn, opencv, pillow, numpy
#   4. Downloads the YuNet face detection model (~400 KB)
#   5. Starts the local server on http://127.0.0.1:7865
#
# Everything runs LOCALLY — no data is sent anywhere.
# Source: https://github.com/nicenemo/anonymizer
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
REQUIREMENTS="$SCRIPT_DIR/requirements.txt"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  W3PN ANONYMIZER — Python backend setup & start          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ── 1. Check Python ──────────────────────────────────────────────
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "❌  Python not found."
  echo "    Install Python 3.9+ from https://python.org"
  echo "    Then run this script again."
  exit 1
fi

PY_VERSION=$($PYTHON -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✓  Python $PY_VERSION found at $(command -v $PYTHON)"

# ── 2. Create virtual environment ───────────────────────────────
if [ ! -d "$VENV_DIR" ]; then
  echo "→  Creating virtual environment…"
  $PYTHON -m venv "$VENV_DIR"
else
  echo "✓  Virtual environment exists"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

# ── 3. Install dependencies ─────────────────────────────────────
echo "→  Installing dependencies…"
pip install --quiet --upgrade pip
pip install --upgrade -r "$REQUIREMENTS"
echo "✓  All packages installed"

# ── 4. Download YuNet model ──────────────────────────────────────
MODELS_DIR="$SCRIPT_DIR/models"
MODEL_FILE="$MODELS_DIR/face_detection_yunet_2023mar.onnx"
MODEL_URL="https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"

mkdir -p "$MODELS_DIR"
if [ ! -f "$MODEL_FILE" ]; then
  echo "→  Downloading YuNet model…"
  curl -fL --progress-bar "$MODEL_URL" -o "$MODEL_FILE" 2>&1 || \
    wget -q --show-progress "$MODEL_URL" -O "$MODEL_FILE" 2>&1 || \
    echo "⚠  Could not download model — will retry on first use"
else
  echo "✓  YuNet model present"
fi

# ── 5. Start server ─────────────────────────────────────────────
echo ""
echo "✅  Setup complete! Starting server…"
echo "    http://127.0.0.1:7865"
echo "    Press Ctrl+C to stop."
echo ""
cd "$SCRIPT_DIR"
exec python main.py
