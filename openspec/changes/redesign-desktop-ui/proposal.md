# Proposal

## Why

The desktop client from `desktop-shell-owned-library` works but looks unfinished: covers are stretched 90 px IGDB
thumbnails, the screens use default Mantine greys instead of GameNode's surfaces, there is no GameNode font or logo,
and the layout reads like a debug page. Every later desktop step (Steam, Proton, OptiScaler) adds screens on top of
this one, so the visual base has to match the GameNode design system (Figma file `GameNode`, page "Design System",
plus the frame on page "Desktop") before more is built on it.

On 2026-11-03 the roadmap (`docs/desktop-mvp-roadmap.md`, step 1) changed direction: desktop is a unified launcher
for games installed on this PC and uses desktop data only. The owned library from web connections and the importer
conflicts with that, so this change also rescopes the shell: it keeps the library UI and removes the web-connection
data. `desktop-shell-owned-library` is archived; its unfinished tasks continue here.

## What Changes

- Desktop renderer adopts the project's design tokens the way web and mobile do: Tailwind with
  `@repo/tailwind-config` (paper surfaces, brand scale, dimmed text), `DEFAULT_MANTINE_THEME`, the Roboto font and
  Tabler icons. The Figma primitives (`color/paper/0..8`, `color/brand/0..9`, `color/text`, `color/dimmed`, Mantine
  spacing/radius) are already these values; no new palette is introduced.
- App frame per the Figma "Desktop" frame: a top bar with the GameNode logo, a "Library" nav item, and the user menu
  (avatar, Sign out), drawn into the title bar area with the OS window controls kept native.
- Library rebuilt visually from the design system: filter sidebar styled as "Sidebar/Expanded Collections" (section
  labels, menu items, counts), toolbar with search input and view toggle styled per "Buttons" and
  "Badges/Tag Filter", game cards as "GameCover" (264:354 ratio, `cover_big` IGDB size, cropped not stretched,
  placeholder image), list rows and detail pane on paper surfaces, empty/loading/error/offline states styled per
  "Feedback".
- Sign-in screen rebuilt on the same surfaces with the logo and provider buttons per the design system.
- Covers fixed: use the existing `getSizedImageUrl` helper with `cover_big`/`cover_big_2x` instead of the raw
  `t_thumb` URL.

- **Desktop data only (roadmap step 1).** Remove `useOwnedLibrary`/`loadOwnedSource`, the importer list and import
  calls (Import / Import into collection menu items, Ctrl+I, collection picker, batch import), the persisted query
  cache with the offline "last synced" view, "Manage stores" and the no-linked-stores state. The library shows an
  empty state until step 2's providers fill it. **BREAKING** for `desktop-library`.

Other library behavior (filters, sorting, keyboard, selection, remaining menu items, detail pane, remembered layout)
is unchanged.

Out of scope: Collections, Achievements and Journal nav items shown in the Figma frame (no desktop screens exist for
them yet; adding dead links is worse than omitting them), Add Game button, notifications bell, light theme, custom
window controls, changes to web/mobile/admin.

## Capabilities

### New Capabilities
- `desktop-appearance`: how the desktop client looks: design-system tokens and font, the app frame and top bar,
  game cover rendering, and the visual states of the sign-in and library screens.

### Modified Capabilities

- `desktop-library`: desktop data only; empty state replaces the no-linked-stores state; import, owned-games
  cache, offline view and per-store failures are removed; filters, columns, menus and detail pane drop the
  importer fields.

## Impact

- Code: `apps/desktop/src/renderer/**` (App, Library, new small components, CSS), `apps/desktop/src/main/index.ts`
  (window title bar options), `apps/desktop` Tailwind/PostCSS config and `public/` assets (logo, placeholder, font).
- `packages/ui/package.json`: one more subpath export for `getSizedImageUrl` (the desktop imports `@repo/ui` by
  subpath to avoid the web/mobile barrel).
- Dependencies (desktop only, already in the workspace): `tailwindcss`, `postcss`, `postcss-preset-mantine`,
  `autoprefixer`, `@repo/tailwind-config`, `@tabler/icons-react`.
- Removed code: `library/useOwnedLibrary.ts`, the importer parts of `library/model.ts` and their tests,
  `cache.ts`/`cache.test.ts`, `PersistQueryClientProvider` in `App.tsx`, the import items in the main-process menus.
  `tests/library.smoke.cjs` stops mocking `/v1/connections` and `/v1/importer`.
- Ordering: `desktop-shell-owned-library` is archived (2026-11-04); its specs are the baseline this change modifies.
