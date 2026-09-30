@echo off
setlocal
cd /d "%~dp0"
set PORT=44090
set HOSTNAME=127.0.0.1
echo Starting Kaixin Zhike on http://localhost:%PORT% ...
start "" http://localhost:%PORT%
"%~dp0node.exe" "%~dp0server.js"
pause
