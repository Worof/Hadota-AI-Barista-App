@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (start "" http://localhost:8000 & py -m http.server 8000 & exit /b)
where python >nul 2>nul
if %errorlevel%==0 (start "" http://localhost:8000 & python -m http.server 8000 & exit /b)
echo Python is not installed. Install it from python.org (tick "Add python.exe to PATH"), then double-click this file again.
pause
