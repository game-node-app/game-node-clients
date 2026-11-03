# Design

## Context

- Stack choices (Electron over Tauri, electron-vite, electron-builder) and their reasoning live in the source doc linked
  from `docs/desktop-mvp-roadmap.md`; not repeated here.
- `apps/mobile` is the closest model: a Vite + React client that calls `setProjectContext`, `setupAuthClient`
  (`packages/ui/src/components/auth/authClient.ts`) and `setupWrapper` (`packages/wrapper/src/setUp.ts`) at startup.
  On native it can't use cookies, so the session travels as a bearer token from `getToken`. The desktop renderer has
  the same constraint: its origin is not the API's.
- Sign-in is social-only (`SignInScreen`, `authClient.signIn.social`). Mobile runs it in the system browser via
  `better-auth-capacitor` with the `app.gamenode` scheme and gets the session back by deep link.
- `ImporterScreen` (`packages/ui/src/components/importer/view/ImporterScreen.tsx`) is a paged, per-source web screen;
  per the Desktop UI principle in `docs/desktop-mvp-roadmap.md` it is not reused. Its data calls are:
  `ImporterService` list and batch import, `ImporterResponseItemDto.isInLibrary`, and `useOwnUserConnections` for linked
  connections. `GET /v1/importer/{source}` defaults to `limit=20`; the server's maximum is unknown.
- `@tanstack/query-async-storage-persister` and `@tanstack/react-query-persist-client` are already used by web.

## Goals / Non-Goals

**Goals:**
- Smallest Electron app that meets the specs and that steps 2–6 extend without restructuring (main/preload/renderer split, IPC pattern).
- Share only the data layer with other apps (wrapper, hooks, auth client, theme, Mantine primitives); desktop owns its screens.

**Non-Goals:**
- Router, settings screen, custom window frame (native frame kept for MVP), i18n beyond `@repo/locales` strings.
- Any change to web/admin/mobile or `packages/ui` screens.

## Decisions

1. **Layout: `apps/desktop/src/{main,preload,renderer}`** with electron-vite's default config. Renderer is a plain
   React + Mantine app (`DEFAULT_MANTINE_THEME`, `@repo/ui`, `@repo/wrapper`, `@repo/locales`), no Ionic, no Next.
   Alternative: reuse the web app's Next build — rejected, SSR and routing don't fit a file-served bundle.

2. **Serve the bundle from a privileged custom protocol (`app://gamenode/`)** registered with `protocol.handle`, not
   `file://`. Gives a stable, non-null origin the server can allow in CORS and keeps relative asset paths working.
   Dev mode loads the electron-vite dev server URL only when `!app.isPackaged`.

3. **Window hardening:** `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webSecurity` default;
   `will-navigate` and `setWindowOpenHandler` deny everything except the app origin and hand `http(s)` URLs to
   `shell.openExternal`. CSP meta in `index.html` limiting `connect-src` to the server and search URLs.

4. **Preload exposes one object, `window.gamenode`, with task calls only:** `signIn(provider)`, `getToken()`,
   `signOut()`, `onSessionChanged(cb)`, `openExternal(url)` (http/https only, validated in main),
   `showGameContextMenu(gameIds)` and `onMenuAction(cb)`. Each maps to one `ipcMain.handle` channel; main validates
   arguments. Steps 2+ add tasks the same way.

5. **Auth: system browser + deep link, bearer token in main.** Main registers the `app.gamenode` protocol client
   (same scheme mobile uses, so the server's trusted callback config is reused; Android and desktop never share a
   device). `signIn(provider)` opens the server's social sign-in in the system browser using the same request
   `better-auth-capacitor` makes; the deep link returns the session token, which main stores with `safeStorage`
   in `userData` and announces via `onSessionChanged`. Single-instance lock + `second-instance`/`open-url` deliver
   the link on Windows/Linux. Renderer passes `getToken` to `setupWrapper` and wraps `getAuthClientOptions` with a
   bearer `fetchOptions.auth`, mirroring mobile. The sign-in screen is desktop's own (provider buttons, pending state
   reset on window focus); `SignInScreen` is not reused. Alternative: an in-app `BrowserWindow` for OAuth — rejected,
   Google blocks embedded browsers and it breaks the bundled-UI-only rule.
   First implementation task reads `better-auth-capacitor`'s client to copy the exact URL/token exchange.

6. **Library is desktop-native code under `apps/desktop/src/renderer/library/`.** Layout: sidebar (filters with
   counts) | virtualized grid or list (`@tanstack/react-virtual`) | resizable detail pane. Alternatives: reuse
   `ImporterScreen` in tabs — rejected by the Desktop UI principle; Mantine `Table` without virtualization — too slow
   for thousands of rows.
   - **Data:** `useOwnUserConnections` for sources, then a desktop hook (`useOwnedLibrary`) runs one query per source
     that pages `ImporterService` list with `excludeInLibrary=false` and a large `limit` until `hasNextPage` is false,
     and merges results into one array keyed `source:externalGameId`. Per-source query state drives the sidebar error
     and retry. Filtering, sorting and type-to-filter are pure functions over that array, unit-tested.
   - **Import:** `ImporterService` batch import grouped by source (the same call `ImporterScreen` makes), skipping
     `isInLibrary` entries; then invalidate the affected source queries and fire a `new Notification(...)` from the renderer.
   - **Selection model:** focused id, selected id set, anchor id for Shift-range; one reducer, unit-tested.
     Keyboard handled on the list container; type-to-filter ignores keys while an input is focused.

7. **Cache and layout persistence.** `PersistQueryClientProvider` with `createAsyncStoragePersister` over
   `localStorage`, persisting only the owned-library and connections queries, `maxAge` 30 days, and a cache key
   including the user id so accounts never see each other's data; sign-out clears it. Offline = all source queries
   failed with a network error while cached data exists → read-only banner with `dataUpdatedAt`. Layout state
   (view, sort, filter, pane widths) in `localStorage`. Window bounds saved by main in `userData/window-state.json`
   and validated against `screen.getAllDisplays()` on start.

8. **Native menus built in main.** `Menu.buildFromTemplate` for the right-click menu (via `showGameContextMenu`) and
   the application menu (View: grid/list; Library: import, select all; with accelerators). Clicks are sent back to
   the renderer with `onMenuAction`, which runs the action on the current selection. Alternative: a Mantine `Menu`
   drawn in the page — rejected, it doesn't look or behave like the OS menu (no overflow outside the window, no
   system styling). "Import into collection" opens a renderer modal using the existing collections hooks.

9. **`PROJECT_CONTEXT.client` gains `"desktop"`.** Links that point to web pages (connections page) build
   `https://gamenode.app/...` and go through `openExternal`.

10. **Linux X11 fallback** via `GAMENODE_X11=1` env var: main calls `app.commandLine.appendSwitch("ozone-platform", "x11")`
   before `ready`. Documented in `apps/desktop/README.md`. A settings toggle is deferred.

11. **CI:** a `desktop` job with a matrix (`windows-latest` → NSIS, `ubuntu-latest` → AppImage) running
   `electron-builder --publish never`, uploading `dist/*.exe` / `dist/*.AppImage` via `actions/upload-artifact`.
   It reuses the `checks` job's dependency cache key and runs only when `apps/desktop` or its workspace deps change.

## Risks / Trade-offs

- [Server must allow `app://gamenode` in CORS and the deep-link callback] → server PR is a prerequisite task;
  tested against a local server before merging this change.
- [Deep-link token exchange copied from `better-auth-capacitor` could drift when that library updates] → keep the
  bridge in one main-process file with a unit test of the URL parsing.
- [AppImage needs FUSE; some distros lack it] → document `--appimage-extract-and-run`; Flatpak arrives in step 6.
- [Unknown server max page size; loading a large library takes many requests] → request a large `limit`, measure on a
  real large account, and add a server bulk endpoint later only if needed.
- [Cached library can be stale or briefly wrong after imports elsewhere] → background refresh on start and on window
  focus; show "last synced".
- [More UI code to own than reusing web screens] → accepted per the Desktop UI principle; logic kept in pure, tested
  functions so the components stay thin.
- [Unsigned Windows installer triggers SmartScreen] → expected for testers; signing is step 6.
- [`safeStorage` on Linux without a keyring falls back to a weak `basic_text` backend] → accept for MVP, log a
  warning when `safeStorage.getSelectedStorageBackend()` is `basic_text`.

## Migration Plan

Additive. Ship the server CORS/callback change first, then merge this. Rollback = revert; nothing else depends on it.
