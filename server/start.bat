@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM  ANONYMIZER — Start Python backend server  (Windows)
REM ─────────────────────────────────────────────────────────────────────────────
setlocal

set "SCRIPT_DIR=%~dp0"
set "VENV_DIR=%SCRIPT_DIR%.venv"

if not exist "%VENV_DIR%\" (
    echo  Virtual environment not found — running install first ...
    call "%SCRIPT_DIR%install.bat"
)

call "%VENV_DIR%\Scripts\activate.bat"

echo  Starting ANONYMIZER backend on http://127.0.0.1:7865 ...
cd /d "%SCRIPT_DIR%"
python main.py
endlocal
