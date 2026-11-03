#!/bin/sh
# ELECTRON_EXEC_PATH for electron-vite dev: runs the Windows Electron on the app directory.
# electron-vite restarts Electron on main edits, but killing this shim leaves the Windows window
# open, and its single-instance lock would quit the new one. Stop the old copy first.
app="$1"
shift
dir=$(wslpath -w "$(dirname "$GAMENODE_WIN_ELECTRON")")
powershell.exe -NoProfile -Command "Get-Process electron -ErrorAction SilentlyContinue | Where-Object { \$_.Path -like '$dir\\*' } | Stop-Process -Force; Start-Sleep -Milliseconds 500" >/dev/null 2>&1
exec "$GAMENODE_WIN_ELECTRON" "$(wslpath -w "$app")" "$@"
