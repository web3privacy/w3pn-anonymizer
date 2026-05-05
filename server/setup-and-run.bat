@echo off
REM ─────────────────────────────────────────────────────────────────
REM  W3PN ANONYMIZER — Install dependencies ^& start Python backend
REM
REM  This script:
REM    1. Checks that Python 3.9+ is installed
REM    2. Creates a virtual environment in .\server\.venv
REM    3. Installs packages: fastapi, uvicorn, opencv, pillow, numpy
REM    4. Downloads the YuNet face detection model (~400 KB)
REM    5. Starts the local server on http://127.0.0.1:7865
REM
REM  Everything runs LOCALLY — no data is sent anywhere.
REM  Source: https://github.com/nicenemo/anonymizer
REM ─────────────────────────────────────────────────────────────────
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "VENV_DIR=%SCRIPT_DIR%.venv"

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  W3PN ANONYMIZER — Python backend setup ^& start          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM ── 1. Check Python ────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    where python3 >nul 2>&1
    if errorlevel 1 (
        echo  ERROR: Python not found.
        echo  Install Python 3.9+ from https://python.org
        echo  Then run this script again.
        pause
        exit /b 1
    )
    set PYTHON=python3
) else (
    set PYTHON=python
)

for /f "tokens=*" %%i in ('%PYTHON% -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set PY_VERSION=%%i
echo  ^> Python %PY_VERSION% found

REM ── 2. Create virtual environment ─────────────────────────────
if not exist "%VENV_DIR%\" (
    echo  ^> Creating virtual environment...
    %PYTHON% -m venv "%VENV_DIR%"
) else (
    echo  ^> Virtual environment exists
)

call "%VENV_DIR%\Scripts\activate.bat"

REM ── 3. Install dependencies ───────────────────────────────────
echo  ^> Installing dependencies...
pip install --quiet --upgrade pip
pip install --upgrade -r "%SCRIPT_DIR%requirements.txt"
echo  ^> All packages installed

REM ── 4. Download YuNet model ───────────────────────────────────
set "MODELS_DIR=%SCRIPT_DIR%models"
set "MODEL_FILE=%MODELS_DIR%\face_detection_yunet_2023mar.onnx"
set "MODEL_URL=https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"

if not exist "%MODELS_DIR%\" mkdir "%MODELS_DIR%"

if not exist "%MODEL_FILE%" (
    echo  ^> Downloading YuNet model...
    powershell -Command "Invoke-WebRequest -Uri '%MODEL_URL%' -OutFile '%MODEL_FILE%' -UseBasicParsing"
    if errorlevel 1 (
        echo  WARNING: Could not download model — will retry on first use.
    )
) else (
    echo  ^> YuNet model present
)

REM ── 5. Start server ───────────────────────────────────────────
echo.
echo  Setup complete! Starting server...
echo    http://127.0.0.1:7865
echo    Press Ctrl+C to stop.
echo.
cd "%SCRIPT_DIR%"
%PYTHON% main.py

endlocal
