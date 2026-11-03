#!/usr/bin/env bash
# Run the app in a Windows Electron from WSL. electron-vite rebuilds main and preload on save and
# serves the renderer with hot reload; scripts/electron-win.sh starts the Windows copy.
# Closing the Windows window stops the session.
set -euo pipefail
cd "$(dirname "$0")/.."

: "${GAMENODE_WIN_ELECTRON:?set it to electron.exe under /mnt/c, see apps/desktop/README.md}"
[ -f "$GAMENODE_WIN_ELECTRON" ] || { echo "No electron.exe at $GAMENODE_WIN_ELECTRON" >&2; exit 1; }

export ELECTRON_EXEC_PATH="$PWD/scripts/electron-win.sh"
export WSLENV="ELECTRON_RENDERER_URL${WSLENV:+:$WSLENV}"
yarn electron-vite dev -w
