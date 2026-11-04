# Tasks

Work happens in the `feat/desktop-client-mvp` worktree (`apps/desktop`). Design reference: Figma
`ikcThguwowTdynGz0L2YkS`, nodes `127:168` (Design System) and `3728:627` (Desktop).

## 1. Design-system foundation

- [x] 1.1 Add `tailwind.config.ts` (preset `@repo/tailwind-config`, content `src/renderer/**` + `../../packages/ui/src/**`) and `postcss.config.js` copied from `apps/mobile`, plus the dev dependencies mobile uses (`tailwindcss`, `postcss`, `postcss-preset-mantine`, `postcss-simple-vars`, `postcss-import`, `autoprefixer`, `@repo/tailwind-config`) and `@tabler/icons-react`; verify `yarn build -F desktop` succeeds and a `bg-paper-1` test element renders `#262525`
- [x] 1.2 Replace `style.css` with `globals.css`: `@tailwind base` inside `@layer tailwind`, Roboto `@font-face`, `--mantine-color-body: #161616` and `--mantine-color-text: #D9D9D9` under `dark-root`; copy `Roboto-Variable.ttf`, `main-logo.png`, `short-logo.png`, `game_placeholder.jpeg` from `apps/mobile/public` into the renderer public dir; verify in devtools offline that computed `font-family` resolves to the bundled Roboto and the body is `#161616`
- [x] 1.3 Add `"./image": "./src/components/game/util/getSizedImageUrl.ts"` to `packages/ui/package.json` exports; verify `yarn type-check` passes at the root

## 2. Covers

- [x] 2.1 Change `gameCover` in `library/model.ts` to take an `ImageSize` and return `getSizedImageUrl` output, or `undefined` when the result is not an `https` URL; extend `model.test.ts` with an IGDB `t_thumb` URL (→ `t_cover_big`), a protocol-relative URL, a non-IGDB URL and a missing cover; verify `yarn test -F desktop` passes
- [ ] 2.2 `components/Cover.tsx`: `AspectRatio` 264/354, `Image fit="cover"`, `cover_big` src with `cover_big_2x` 2x `srcSet`, placeholder fallback, lazy loading; verify on a 150% scaled display that a grid cover is sharp and undistorted and a game without cover shows the placeholder (spec "Game covers keep their proportions")

## 3. App frame

- [x] 3.1 Main window: `titleBarStyle: "hidden"`, `titleBarOverlay` (`#262525`, symbols `#D9D9D9`, height 48), `backgroundColor: "#161616"`; Linux falls back to the native frame only if the overlay misbehaves; add preload task `showAppMenu()` popping the application menu at the given point (main validates the numbers); update `bridge.ts` types and the shell smoke test's expected `window.gamenode` keys; verify `yarn test -F desktop` and the smoke test pass
- [ ] 3.2 Cache `{ userId, name }` in `gamenode-identity` and pass `user` to `UserLibrary`; `components/TopBar.tsx` with drag region, menu button, logo, active "Library" nav item and avatar `Menu` (username, Sign out), right padding from `env(titlebar-area-width)`; remove Sign out from the old toolbar/sidebar; verify the "App frame with top bar" scenarios by hand on Windows and Linux (drag, OS controls, menu button, user menu offline)

## 4. Library restyle

- [x] 4.1 Split `Library.tsx` presentation into `Sidebar.tsx`, `Toolbar.tsx`, `GameCard.tsx`, `GameRow.tsx`, `DetailPane.tsx`, `StateMessage.tsx` with no behavior change; verify `yarn test -F desktop`, `yarn lint -F desktop`, `yarn type-check -F desktop` and `tests/library.smoke.cjs` pass
- [x] 4.2 Sidebar per "Sidebar/Expanded Collections": "Library"/"Stores" section labels, items with right-aligned counts, active on `bg-paper-1`, inline sync loader and error icon with Retry; verify the "Library sidebar follows the design system" scenario and that a forced store failure still shows Retry (desktop-library "Per-store load failures")
- [x] 4.3 Toolbar (search input with icon, selection count, grid/list tag-filter toggles, primary Import) and grid cards (cover, truncated name, store, hover/selected/focus states, "In GameNode" badge); grid row height derived from column width; verify the "Game card states" and "View toggle" scenarios and that the 290 px row clipping is gone at window widths 800–2560 px
- [x] 4.4 List rows (48 px, `cover_small` thumbnail, sortable header with chevrons) and detail pane (cover, title, store/year, badge, Import, close icon) on paper surfaces; 1 px splitters with brand hover; verify sorting, resizing and Enter-to-open still work as in `desktop-library`
- [x] 4.5 States via `StateMessage` (loading stores, no linked stores, stores load error, no matches) and the slim status bar for offline, action errors and import results; verify the "Screen states follow the design system" scenarios, including that showing/hiding the bar shifts nothing but the content top
- [x] 4.6 Restyle the collections modal with design-system inputs/buttons; verify "Import into collection" from the context menu still imports

## 5. Sign-in

- [x] 5.1 Rebuild the sign-in screen (paper card, logo, heading, dimmed text, provider buttons with Tabler brand icons, inline error) and session restoring/retry states with `StateMessage`; verify the "Sign-in screen follows the design system" scenario and the sign-in/cancel scenarios from `desktop-shell`

## 6. Visual acceptance

- [ ] 6.1 After section 7, screenshot sign-in, the empty library, the offline bar and the open user menu on Windows and Linux at 100% and 150% scale; compare against the Figma Design System tokens and Desktop frame and attach the screenshots to the PR (grid, list and detail pane screenshots move to roadmap step 2, when there is data to show)

## 7. Desktop data only (roadmap step 1, design decision 8)

- [x] 7.1 `model.ts`: add `LibraryGame` and `Filter = "all" | string`; delete `loadOwnedSource` (including the uncommitted 404 handling), `mergeOwnedSources`, `importOwnedGames`, `SOURCES`, `STORE_NAMES`, the importer DTO imports and their tests in `model.test.ts`; `layout.ts` accepts any stored filter string; `Library` takes `games: LibraryGame[]` and `UserLibrary` passes `[]`; delete `useOwnedLibrary.ts`; verify `yarn test -F desktop` and `yarn type-check -F desktop` pass
- [x] 7.2 Remove import: the import mutation, collection modal and `useUserLibrary` use in `Library.tsx`, Import buttons in `Toolbar.tsx`/`DetailPane.tsx`, the "In GameNode" badge, in-library/not-imported filters and column, the Import / Import into collection menu items and `CmdOrCtrl+I` in `src/main/index.ts`, and `import`/`import-collection` from `MenuAction` in `src/shared/bridge.ts`; verify the context menu shows only Open on GameNode, Copy name and Select all (desktop-library "Native context and application menus")
- [x] 7.3 Remove web-connection data: `PersistQueryClientProvider`, `cache.ts`/`cache.test.ts` and the `@tanstack/query-async-storage-persister`/`@tanstack/react-query-persist-client` dependencies (keep the sign-out removal of `gamenode-library:*` keys), "Manage stores" in `TopBar.tsx`, the no-linked-stores and stores-error states, per-store loader/error/Retry in `Sidebar.tsx`, the `./connections` export in `packages/ui/package.json` (and `./library` if nothing imports it any more); `StatusBar` offline from `navigator.onLine` only; verify `grep -rnE "connections|[Ii]mporter" apps/desktop/src` finds nothing and `yarn lint -F desktop` passes
- [x] 7.4 Empty state via `StateMessage` ("No games yet", "Games installed on this PC will appear here.", no button) and sidebar "Sources" section built from the sources present in `games`; verify the "Empty library" scenarios (desktop-library and desktop-appearance)
- [x] 7.5 Rewrite `tests/library.smoke.cjs` for the empty library: drop the `/v1/connections` and `/v1/importer` mocks, fail on any request to those paths, assert the empty state, the trimmed menus, the offline bar, sign-out and 401 expiry; the virtualization, keyboard and range-selection checks move to step 2's smoke test with scanned fixtures (the pure filter/sort/selection unit tests stay); verify the smoke test passes

## 8. Carried over from `desktop-shell-owned-library`

- [ ] 8.1 (was 4.3) Verify the sign-in, cancel, restart and expired-token scenarios in `openspec/specs/desktop-shell/spec.md` by hand against a local server
- [ ] 8.2 (was 7.1) The `desktop` job in `.github/workflows/ci.yml` exists; verify a PR run uploads the `.exe` and `.AppImage` artifacts
- [ ] 8.3 (was 8.1, rescoped) Install the CI Windows installer and AppImage on real Windows and Linux machines, sign in, restart signed in and see the empty library (roadmap step 1 "Done when")

## Workflow follow-up

- 2026-11-04: User accepted the Windows empty-library appearance (screenshot supplied) and confirmed that the signed-in session survives restarts. This covers the Windows empty-state and session-restart checks; display scale, other screen states, cancel/expiry and Linux manual acceptance remain unverified.

- 2026-11-04: User confirmed previous Windows and Linux builds count as build validation; CI artifact verification (8.2) is deferred for now. This does not complete the remaining visual, session or installation acceptance checks.

- `desktop-shell-owned-library` was archived on 2026-11-04 with four open tasks: 4.3, 7.1 and 8.1 continue as 8.1–8.3 above; 5.3 (smooth scrolling with several thousand games) moves to roadmap step 2, which brings real data.
- When archiving this change, update the Purpose of `openspec/specs/desktop-library/spec.md` to the desktop-data library (it still describes owned games from linked stores).
