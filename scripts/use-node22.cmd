@echo off
setlocal

for %%I in ("%~dp0..\.tools\node-v22.22.1-win-x64") do set "NODE22_DIR=%%~fI"

if not exist "%NODE22_DIR%\node.exe" (
  echo Node 22 runtime not found at "%NODE22_DIR%"
  exit /b 1
)

set "PATH=%NODE22_DIR%;%PATH%"

if "%~1"=="" (
  node -v
  npm.cmd -v
  exit /b 0
)

%*
