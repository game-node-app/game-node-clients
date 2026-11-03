# GameNode Desktop: MVP roadmap

Source: [GameNode Desktop: MVP & Stack Decisions](https://claude.ai/artifact/TKp7K8TksQs4W9md5C7bve) (2026-11-02).
That doc holds the reasoning (Electron over Tauri, umu + GE-Proton, OptiScaler rules). This file only orders the work.

Six steps, each meant to become one OpenSpec change. Every step ships something a user can run and use; none is setup-only.

MVP = a Windows and Linux Electron app (`apps/desktop`) that shows one library (owned from GameNode + installed locally),
launches games, records playtime, runs non-Steam games through Proton on Linux, and installs OptiScaler per game.

## Desktop UI principle

GameNode Desktop is a native-feeling program, not the website in a window. Share the data layer (`@repo/wrapper`,
`packages/ui` hooks, theme tokens and Mantine primitives); write screens from scratch for desktop use: keyboard,
context menus, multi-select, split panes, local cache, remembered layout. Accept desktop-specific problems
(cache staleness, more UI code to own) for these advantages.

## Assumptions (from the doc's open questions)

| Question | Assumed answer | Affects |
| --- | --- | --- |
| macOS in the MVP? | No. Windows and Linux only. | Steps 1, 6 |
| GameNode login required? | Yes. The owned library and playtime live on the server. | Step 1 |
| Windows code signing | Decided in step 6 (Azure Artifact Signing vs OV cert). | Step 6 |

Change an assumption and the matching step changes; the order does not.

## Order

```
1 Shell + owned library ─► 2 Steam ─► 3 Epic, GOG, local exe ─► 4 Linux/Proton runner ─► 5 OptiScaler
                                                                                          │
                       6 Release builds (signed Windows, AppImage, Flatpak) ◄─────────────┘
```

Steps 3 and 4 can run in parallel after 2. Step 5 needs 4 for its Proton half only.

## Step 1: Desktop shell with the owned library

**User gets:** an installable app (Windows, Linux AppImage) that logs into GameNode and lists the games they own across linked stores.

- Scaffold `apps/desktop` with electron-vite + electron-builder (Vite + React), wired into turbo and yarn workspaces.
- Reuse the data layer only: `packages/ui` theme (`DEFAULT_MANTINE_THEME`), hooks and `@repo/wrapper`; sign-in and library screens are written for desktop.
- Security baseline, non-negotiable from day one: `contextIsolation`, `sandbox: true`, `nodeIntegration: false`,
  bundled UI only (never load gamenode.app in the window), typed preload exposing task-level calls only.
- GameNode login (same better-auth setup as web).
- Unified library view written for desktop (see principle) from `GET /v1/connections/own` + `GET /v1/importer/{source}`;
  import into the GameNode library via `POST /v1/importer/{source}/import`.
- Linux: `--ozone-platform=x11` fallback for Wayland + NVIDIA.
- CI builds unsigned Windows installer and AppImage as artifacts.

**Done when:** a tester installs the CI build on Windows and Linux, logs in, and sees their owned games.

**Out of scope:** launching, local scanning, tray, auto-update.

## Step 2: Steam scan, launch and playtime

**User gets:** installed Steam games marked in the library, a Play button, and playtime recorded on GameNode.

- Parse `libraryfolders.vdf` + `appmanifest_*.acf` (Windows and `~/.steam/steam` on Linux), each parser with fixture tests.
- Match installed games to GameNode games via `GET /v1/game/external`; unmatched ones go to the existing unmapped-games flow.
- Merge owned and installed into the unified library (installed, owned-not-installed, installed-not-owned-on-GameNode).
- Launch with `steam://rungameid/<appid>`.
- Process watcher (main process) detects game start/stop and submits sessions to `POST /v1/playtime`.
- Tray mode: closing the window keeps only the tray process alive while a game runs.
- Spike: confirm `steam://` launch and process watching work under `flatpak-spawn --host`, since Flathub is the Steam Deck path. Record the result in the change.

**Done when:** a Steam game launches from GameNode Desktop on both OSes and its session appears in GameNode playtime.

## Step 3: Epic, GOG, Heroic/Lutris and local executables

**User gets:** the library covers the other common PC sources, and any DRM-free game can be added by hand.

- Epic: launcher manifests in `ProgramData\Epic\...\Manifests` (Windows), Heroic's Legendary install list (Linux). Match by Epic namespace (category 1001) via `/v1/game/external`. Launch via Epic URL or Heroic.
- GOG: registry `GOG.com\Games` (Windows), Heroic's GOG install list (Linux). Launch via Galaxy command line, the game exe, or Heroic.
- Heroic/Lutris-installed games: detect and list, launch through that app.
- Local `.exe`: user adds it, picks the GameNode game; runs directly on Windows. (Linux launch comes in step 4.)
- Playtime for all of the above through the step 2 watcher.

**Done when:** an Epic, a GOG and a manually added game each show as installed, launch, and record playtime on Windows; Epic/GOG via Heroic work on Linux.

**Out of scope:** Xbox, Battle.net, EA, Ubisoft scanning; downloading/installing games ourselves.

## Step 4: Linux/Proton runner

**User gets:** non-Steam Windows games (local exe, GOG offline installers) playable on Linux from GameNode Desktop.

- Download the umu zipapp from GitHub releases on first use; detect missing Python 3 and tell the user.
- Download and manage GE-Proton releases in the app data folder; default version plus per-game picker.
- One Wine prefix per game; launch with `umu-run`, playtime via the step 2 watcher.
- Settings screen to list/remove downloaded Proton versions.

**Done when:** a local Windows exe added in step 3 launches on Linux (desktop and Steam Deck desktop mode) through umu + GE-Proton and records playtime.

## Step 5: OptiScaler install and uninstall

**User gets:** one-click OptiScaler per game, safely reversible, blocked where it could get them banned.

- Anti-cheat block: refuse if the game folder contains EasyAntiCheat or BattlEye, or the game is on our blocklist. Explicit warning before any install.
- Version picker; download the release `.7z` from GitHub at runtime, cache it, extract with a bundled 7-Zip binary. Show source link and GPL-3.0 license in the UI.
- Place files next to the main exe as `dxgi.dll` (fallback `winmm.dll` / `version.dll`), keep `OptiScaler.ini` name.
- Back up overwritten files and record installed files so uninstall restores the folder exactly.
- Linux: set `WINEDLLOVERRIDES=<dll>=n,b` for umu launches; for Steam games show the launch-options line with a copy button.
- All file writes happen in the main process behind task-level preload calls (`installOptiScaler(gameId)`), never a generic write-path API.

**Done when:** install then uninstall on a test game leaves the folder byte-identical; an EAC/BattlEye game is refused; OptiScaler loads in-game on Windows and under umu on Linux.

## Step 6: Release builds

**User gets:** a trusted public download on every supported platform.

- Signed Windows installer (pick Azure Artifact Signing or OV cert here); signing also reduces antivirus false positives from step 5.
- AppImage and Flatpak on Flathub, with the host access step 2's spike proved necessary.
- Add `desktop` as a releasable app in the changesets flow from `docs/releases.md`, and publish builds from the release job.
- Steam Deck Game Mode doc: add GameNode as a non-Steam game.

**Done when:** a tagged release publishes the signed Windows installer, AppImage and Flathub build, and each installs and passes the step 2 smoke test (log in, launch, playtime).

## Deferred (not in any step)

Social features (feed, posts, reviews, journal), cloud saves, DLSS swapper, store downloads, Xbox/Battle.net/EA/Ubisoft local scans,
writing Steam launch options directly, controller navigation, macOS.
