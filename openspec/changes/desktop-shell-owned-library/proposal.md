# Proposal

## Why

GameNode has no PC client, so PC players can't see their owned games next to where they play them. Step 1 of
`docs/desktop-mvp-roadmap.md` gives them an installable Windows/Linux app that logs in and shows the games they own
across linked stores, and lays the secure Electron base every later step (Steam, Proton, OptiScaler) builds on.

## What Changes

- New `apps/desktop`: Electron app (electron-vite + electron-builder, Vite + React), in the yarn workspaces and turbo pipeline.
- Window hardened from day one: context isolation, sandbox, no Node in the renderer, bundled UI only, typed task-level preload.
- GameNode sign-in with the existing social providers through the system browser, returning to the app by a deep link;
  session kept encrypted on disk.
- Unified owned library, written for desktop: one list across all linked stores (from `GET /v1/connections/own` and
  `GET /v1/importer/{source}`, including games already in the GameNode library) with sidebar filters, grid/list views,
  keyboard navigation, multi-select, native context and app menus, a detail pane, an on-disk cache for instant and
  offline start, and remembered layout. Import via `POST /v1/importer/{source}/import`.
- Reuses the data layer only (`@repo/wrapper`, `packages/ui` hooks, auth client, `DEFAULT_MANTINE_THEME`, Mantine
  primitives). Sign-in and library screens are desktop's own; see the Desktop UI principle in `docs/desktop-mvp-roadmap.md`.
- Linux: X11 fallback switch for Wayland + NVIDIA.
- CI builds an unsigned Windows installer and a Linux AppImage as workflow artifacts (no release publishing yet).

Out of scope: launching games, local scanning, tray, auto-update, signing, macOS.

## Capabilities

### New Capabilities
- `desktop-shell`: the desktop app's window security baseline, sign-in/session handling, Linux display fallback and CI-built installers.
- `desktop-library`: the desktop's unified view of owned games across linked stores, how users browse and select them, and importing them into GameNode.

### Modified Capabilities

(none)

## Impact

- New: `apps/desktop`, a CI job building desktop artifacts, `"desktop"` in the `client` union of `packages/ui/src/util/projectContext.ts`.
- New dependencies (desktop only): `electron`, `electron-vite`, `electron-builder`, `@tanstack/react-virtual`.
- Server (game-node-server, separate repo): must accept the desktop renderer origin for CORS and the desktop deep-link
  scheme as a trusted auth callback. No new endpoints.
- Not touched: web, admin, mobile, `packages/ui` screens, release flow (`docs/releases.md`; desktop joins it in step 6).
