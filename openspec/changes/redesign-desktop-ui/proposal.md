# Proposal

## Why

The desktop client from `desktop-shell-owned-library` works but looks unfinished: covers are stretched 90 px IGDB
thumbnails, the screens use default Mantine greys instead of GameNode's surfaces, there is no GameNode font or logo,
and the layout reads like a debug page. Every later desktop step (Steam, Proton, OptiScaler) adds screens on top of
this one, so the visual base has to match the GameNode design system (Figma file `GameNode`, page "Design System",
plus the frame on page "Desktop") before more is built on it.

## What Changes

- Desktop renderer adopts the project's design tokens the way web and mobile do: Tailwind with
  `@repo/tailwind-config` (paper surfaces, brand scale, dimmed text), `DEFAULT_MANTINE_THEME`, the Roboto font and
  Tabler icons. The Figma primitives (`color/paper/0..8`, `color/brand/0..9`, `color/text`, `color/dimmed`, Mantine
  spacing/radius) are already these values; no new palette is introduced.
- App frame per the Figma "Desktop" frame: a top bar with the GameNode logo, a "Library" nav item, and the user menu
  (avatar, Manage stores, Sign out), drawn into the title bar area with the OS window controls kept native.
- Library rebuilt visually from the design system: filter sidebar styled as "Sidebar/Expanded Collections" (section
  labels, menu items, counts), toolbar with search input, view toggle and Import button styled per "Buttons" and
  "Badges/Tag Filter", game cards as "GameCover" (264:354 ratio, `cover_big` IGDB size, cropped not stretched,
  placeholder image), list rows and detail pane on paper surfaces, empty/loading/error/offline states styled per
  "Feedback".
- Sign-in screen rebuilt on the same surfaces with the logo and provider buttons per the design system.
- Covers fixed: use the existing `getSizedImageUrl` helper with `cover_big`/`cover_big_2x` instead of the raw
  `t_thumb` URL.

Behavior from `desktop-shell-owned-library` (filters, sorting, keyboard, selection, menus, import, cache, remembered
layout) is unchanged; only presentation and the placement of Sign out (toolbar → user menu) move.

Out of scope: Collections, Achievements and Journal nav items shown in the Figma frame (no desktop screens exist for
them yet; adding dead links is worse than omitting them), Add Game button, notifications bell, light theme, custom
window controls, changes to web/mobile/admin.

## Capabilities

### New Capabilities
- `desktop-appearance`: how the desktop client looks: design-system tokens and font, the app frame and top bar,
  game cover rendering, and the visual states of the sign-in and library screens.

### Modified Capabilities

(none — `desktop-library` and `desktop-shell` behavior stays as specified in `desktop-shell-owned-library`)

## Impact

- Code: `apps/desktop/src/renderer/**` (App, Library, new small components, CSS), `apps/desktop/src/main/index.ts`
  (window title bar options), `apps/desktop` Tailwind/PostCSS config and `public/` assets (logo, placeholder, font).
- `packages/ui/package.json`: one more subpath export for `getSizedImageUrl` (the desktop imports `@repo/ui` by
  subpath to avoid the web/mobile barrel).
- Dependencies (desktop only, already in the workspace): `tailwindcss`, `postcss`, `postcss-preset-mantine`,
  `autoprefixer`, `@repo/tailwind-config`, `@tabler/icons-react`.
- Ordering: applies on top of the uncommitted `desktop-shell-owned-library` implementation (worktree branch
  `feature/desktop-client-mvp`); that change should be archived first.
