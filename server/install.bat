@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  ANONYMIZER — Python backend dependency installer  (Windows)
REM ─────────────────────────────────────────────────────────────────────────────
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "VENV_DIR=%SCRIPT_DIR%.venv"

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║   ANONYMIZER — Backend dependency installer          ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

REM ── Check Python ─────────────────────────────────────────────────────────────
where python >nul 2>&1
if errorlevel 1 (
    where python3 >nul 2>&1
    if errorlevel 1 (
        echo  ERROR: Python not found. Install Python 3.9+ from https://python.org
        pause
        exit /b 1
    )
    set PYTHON=python3
) else (
    set PYTHON=python
)

for /f "tokens=*" %%i in ('%PYTHON% -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"') do set PY_VERSION=%%i
echo  ^> Python %PY_VERSION% found

REM ── Create / update virtual environment ──────────────────────────────────────
if not exist "%VENV_DIR%\" (
    echo  ^> Creating virtual environment at %VENV_DIR% ...
    %PYTHON% -m venv "%VENV_DIR%"
) else (
    echo  ^> Virtual environment already exists
)

REM ── Activate venv ────────────────────────────────────────────────────────────
call "%VENV_DIR%\Scripts\activate.bat"

REM ── Upgrade pip ──────────────────────────────────────────────────────────────
echo  ^> Upgrading pip ...
pip install --quiet --upgrade pip

REM ── Install dependencies ─────────────────────────────────────────────────────
echo  ^> Installing dependencies from requirements.txt ...
pip install --upgrade -r "%SCRIPT_DIR%requirements.txt"

REM ── Download YuNet ONNX model ─────────────────────────────────────────────────
set "MODELS_DIR=%SCRIPT_DIR%models"
set "MODEL_FILE=%MODELS_DIR%\face_detection_yunet_2023mar.onnx"
set "MODEL_URL=https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"

if not exist "%MODELS_DIR%\" mkdir "%MODELS_DIR%"

if not exist "%MODEL_FILE%" (
    echo  ^> Downloading YuNet ONNX model ...
    powershell -Command "Invoke-WebRequest -Uri '%MODEL_URL%' -OutFile '%MODEL_FILE%' -UseBasicParsing"
    if errorlevel 1 (
        echo  WARNING: Could not download model — it will be fetched on first server start.
    )
) else (
    echo  ^> YuNet ONNX model already present
)

echo.
echo  Installation complete!
echo.
echo    To start the backend server run:
echo      server\start.bat
echo.
pause
endlocal
