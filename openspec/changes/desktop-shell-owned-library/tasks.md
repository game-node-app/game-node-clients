# Tasks

## 1. Server prerequisites

- [ ] 1.1 In game-node-server, allow origin `app://gamenode` in CORS and better-auth trusted origins, and confirm the `app.gamenode` deep-link callback used by mobile works for a desktop request; verify with a local server and `curl -H "Origin: app://gamenode"` on `/v1/auth/get-session` returning the CORS headers

## 2. Scaffold `apps/desktop`

- [ ] 2.1 Create `apps/desktop` with electron-vite (`src/main`, `src/preload`, `src/renderer`), electron-builder config (NSIS + AppImage, appId `app.gamenode.desktop`, `app.gamenode` protocol), `dev`/`build`/`lint`/`type-check`/`test` scripts; verify `yarn install` and `yarn dev -F desktop` open a window
- [ ] 2.2 Add `dev:desktop` to the root `package.json`, a `desktop#build` turbo entry with `dist/**`/`out/**` outputs, and `"desktop"` to the `client` union in `packages/ui/src/util/projectContext.ts`; verify `yarn type-check` and `yarn lint` pass at the root
- [ ] 2.3 Renderer bootstrap: `MantineProvider` with `DEFAULT_MANTINE_THEME`, `QueryClient` with `handleAuthError` (as in mobile `App.tsx`), `setProjectContext`, `setupWrapper` and `setupAuthClient` from `VITE_PUBLIC_*` env; verify the window renders a Mantine page with the brand color

## 3. Window security and window state

- [ ] 3.1 Create the window with `contextIsolation`, `sandbox`, no `nodeIntegration`; serve the packaged bundle from `app://gamenode/` via `protocol.handle`; add the CSP meta; verify in devtools that `typeof require` and `typeof process` are `"undefined"`
- [ ] 3.2 Block `will-navigate` and `window.open` to non-app URLs and route http(s) to `shell.openExternal`; add a main-process unit test for the URL allow/deny function covering app origin, https, `file:`, `javascript:` and other schemes
- [ ] 3.3 Preload exposes `window.gamenode` (`signIn`, `getToken`, `signOut`, `onSessionChanged`, `openExternal`, `showGameContextMenu`, `onMenuAction`) with its type declared for the renderer; verify `Object.keys(window.gamenode)` lists only those names
- [ ] 3.4 Save window bounds and maximized state to `userData/window-state.json` and restore them, falling back to centered when off every display; unit-test the bounds validation and verify both scenarios in the window-state requirement by hand

## 4. Sign-in and session

- [ ] 4.1 Read `better-auth-capacitor`'s client flow and implement the main-process auth bridge: open social sign-in in the system browser, handle the `app.gamenode://` deep link via single-instance lock (`second-instance`) and `open-url`, extract the token; unit-test the deep-link parser with success, error and malformed URLs
- [ ] 4.2 Store the token with `safeStorage` in `userData`, load it on start, delete it on `signOut`; warn in logs on the `basic_text` backend; verify restart keeps the session and sign-out clears the file
- [ ] 4.3 Desktop sign-in screen (own design, provider buttons from the same provider list as web, pending state reset on window focus) calling `window.gamenode.signIn`; bearer `getToken` for wrapper and auth client; on 401 call `signOut` and show sign-in; verify sign-in, cancel, restart and expired-token scenarios from `specs/desktop-shell/spec.md` by hand against a local server

## 5. Desktop library

- [ ] 5.1 `useOwnedLibrary`: one query per linked importer source paging `ImporterService` list (`excludeInLibrary=false`, large `limit`) until `hasNextPage` is false, merged into one array; per-source error/retry state; unit-test the paging loop and merge with mocked pages
- [ ] 5.2 Pure filter/sort/type-to-filter functions and sidebar counts; unit tests for each filter, each sort column in both directions and the text match
- [ ] 5.3 Library layout: sidebar with filter counts and per-store error/retry badge, virtualized grid and list (`@tanstack/react-virtual`) with sortable column headers, no-linked-stores empty state using `openExternal`; verify with an account of several thousand games that scrolling stays smooth
- [ ] 5.4 Selection reducer (focus, toggle, Shift-range, select all) with unit tests; keyboard handling (arrows, Enter, Space, Ctrl+A, Ctrl+I, Ctrl+1/2, type-to-filter, Escape) and Ctrl/Shift-click; verify the keyboard and multi-selection scenarios in `specs/desktop-library/spec.md`
- [ ] 5.5 Native menus in main: context menu via `showGameContextMenu` (Import, Import into collection, Open on GameNode, Copy name) and application menu with accelerators, actions delivered by `onMenuAction`; collection picker modal; batch import grouped by source skipping in-library games, query invalidation and system notification; verify the menu and import scenarios by hand
- [ ] 5.6 Resizable detail pane (cover, name, store, year, matched GameNode game, in-library state, Import action); verify the detail pane scenario
- [ ] 5.7 Persist owned-library and connections queries with `PersistQueryClientProvider` + `createAsyncStoragePersister` (key includes user id, cleared on sign-out); offline read-only banner with last-synced time; persist view, sort, filter and pane widths in `localStorage`; verify the cache, offline and remembered-layout scenarios by restarting with and without network

## 6. Linux fallback and docs

- [ ] 6.1 Append `ozone-platform=x11` when `GAMENODE_X11=1` on Linux before `app.ready`; write `apps/desktop/README.md` (dev setup, env vars, X11 fallback, AppImage FUSE note, keyboard shortcuts); verify `GAMENODE_X11=1` start logs the switch

## 7. CI artifacts

- [ ] 7.1 Add a `desktop` job to `.github/workflows/ci.yml` (matrix `windows-latest`/`ubuntu-latest`, `electron-builder --publish never`, `actions/upload-artifact` for `.exe` and `.AppImage`), gated on desktop or workspace changes; verify a PR run uploads both artifacts

## 8. Acceptance

- [ ] 8.1 Install the CI Windows installer and AppImage on real Windows and Linux machines, sign in and see owned games (roadmap step 1 "Done when")
