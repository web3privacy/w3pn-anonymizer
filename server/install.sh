#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# ANONYMIZER — Python backend dependency installer  (macOS / Linux)
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/.venv"
REQUIREMENTS="$SCRIPT_DIR/requirements.txt"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║   ANONYMIZER — Backend dependency installer          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Check Python ─────────────────────────────────────────────────
if command -v python3 &>/dev/null; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  echo "❌  Python not found. Install Python 3.9+ from https://python.org"
  exit 1
fi

PY_VERSION=$($PYTHON -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
PY_MAJOR=$($PYTHON -c "import sys; print(sys.version_info.major)")
PY_MINOR=$($PYTHON -c "import sys; print(sys.version_info.minor)")

if [ "$PY_MAJOR" -lt 3 ] || { [ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 9 ]; }; then
  echo "❌  Python $PY_VERSION found — need 3.9 or newer."
  exit 1
fi

echo "✓  Python $PY_VERSION found at $(command -v $PYTHON)"

# ── Create / update virtual environment ──────────────────────────
if [ ! -d "$VENV_DIR" ]; then
  echo "→  Creating virtual environment at $VENV_DIR …"
  $PYTHON -m venv "$VENV_DIR"
else
  echo "✓  Virtual environment already exists at $VENV_DIR"
fi

# Activate venv
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"

# ── Upgrade pip ───────────────────────────────────────────────────
echo "→  Upgrading pip …"
pip install --quiet --upgrade pip

# ── Install dependencies ──────────────────────────────────────────
echo "→  Installing dependencies from requirements.txt …"
pip install --upgrade -r "$REQUIREMENTS"

# ── Download YuNet ONNX model ─────────────────────────────────────
MODELS_DIR="$SCRIPT_DIR/models"
MODEL_FILE="$MODELS_DIR/face_detection_yunet_2023mar.onnx"
MODEL_URL="https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"

mkdir -p "$MODELS_DIR"
if [ ! -f "$MODEL_FILE" ]; then
  echo "→  Downloading YuNet ONNX model …"
  if command -v curl &>/dev/null; then
    curl -fL --progress-bar "$MODEL_URL" -o "$MODEL_FILE"
  elif command -v wget &>/dev/null; then
    wget -q --show-progress "$MODEL_URL" -O "$MODEL_FILE"
  else
    echo "⚠   curl / wget not found — model will be downloaded on first server start."
  fi
else
  echo "✓  YuNet ONNX model already present"
fi

echo ""
echo "✅  Installation complete!"
echo ""
echo "    To start the backend server run:"
echo "      ./server/start.sh"
echo ""
