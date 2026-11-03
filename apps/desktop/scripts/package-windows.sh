#!/usr/bin/env bash
# Build the Windows NSIS installer from WSL. electron-builder runs NSIS through Wine, which this
# host lacks, so the Windows programs run through WSL interop instead. The uninstaller step writes
# to Z:\, which is mapped to the WSL root for the duration of the build.
set -euo pipefail
cd "$(dirname "$0")/.."

if cmd.exe /c "net use Z:" >/dev/null 2>&1; then
  echo "Z: is already mapped; run 'net use Z: /delete' on Windows first" >&2
  exit 1
fi
shim="$(mktemp -d)"
cleanup() { cmd.exe /c "net use Z: /delete" >/dev/null 2>&1 || true; rm -rf "$shim"; }
trap cleanup EXIT
cmd.exe /c "net use Z: \\\\wsl.localhost\\${WSL_DISTRO_NAME} /persistent:no"

mkdir -p "$shim/bin" "$shim/lib" "$shim/wine-home"
printf '%s\n' '#!/bin/sh' 'chmod +x "$1"' 'exec "$@"' > "$shim/bin/wine"
chmod +x "$shim/bin/wine"

yarn build
ELECTRON_BUILDER_WINE_TOOLSET_DIR="$shim" yarn electron-builder --win nsis --x64 --publish never

# Self-check: the installer carries the app; the NSIS stub alone is about 200 KB.
find dist -maxdepth 1 -name '*Setup*.exe' -size +50M | grep -q . \
  || { echo "no installer over 50 MB in dist/" >&2; exit 1; }
