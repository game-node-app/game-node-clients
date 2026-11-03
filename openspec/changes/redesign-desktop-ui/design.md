# Design

## Context

- The desktop app exists only as uncommitted work in worktree `t3-c4395aeb` (branch `feature/desktop-client-mvp`),
  implementing `desktop-shell-owned-library`. Renderer: `App.tsx` (sign-in + session), `library/Library.tsx`
  (810 lines: toolbar, sidebar, virtualized grid/list, detail pane, modal), `style.css` (hand-written, uses
  `--mantine-color-dark-*`). Pure logic lives in `library/model.ts`, `layout.ts`, `useOwnedLibrary.ts` with tests.
- Causes of "ugly", found in code:
  - Covers: `gameCover()` returns IGDB's raw `cover.url`, which is the `t_thumb` (90×90) size, then renders it at
    210 px high with `fit="contain"` → blurry, letterboxed, looks distorted. `packages/ui` already has
    `getSizedImageUrl(url, ImageSize.COVER_BIG)` and the 264/354 ratio (`GameFigureImage`).
  - No Tailwind build, so the paper/brand tokens from `@repo/tailwind-config` are unavailable and any `@repo/ui`
    class names render unstyled. No Roboto font file (falls back to system font). Surfaces are Mantine's default dark
    greys, not GameNode paper colors.
  - Layout: toolbar of four equal buttons, sidebar of Mantine `Button`s, Mantine `Alert` banners that push the layout.
- Design source (Figma `ikcThguwowTdynGz0L2YkS`): page "Design System" (127:168) and frame on page "Desktop" (3728:627).
  Figma primitives `color/paper/0..8`, `color/brand/0..9`, `color/text #D9D9D9`, `color/dimmed #808080` equal
  `packages/config-tailwind` exactly; semantic aliases `background = paper/0 #161616`, `surface = paper/1 #262525`.
  Spacing/radius are Mantine defaults. Icons are Tabler. Components used here: Button Primary/Secondary/Outline,
  Inputs/TextInput, Badges/Tag Filter, Sidebar/Expanded Collections + Sidebar Menu Item, GameCover, Feedback, Top Bar.
  Old token sets in the Figma ("Configurações (Sam)", "Landing V3") are marked legacy there and are not used, except
  `color/danger #E5484D` for errors (no current-set equivalent).

## Goals / Non-Goals

**Goals:**
- Same tokens and setup as web/mobile (Tailwind preset + Mantine theme), so desktop screens look like GameNode and
  future steps reuse the same classes.
- Split `Library.tsx` along the visual pieces while restyling, without touching its behavior or tests.

**Non-Goals:**
- New Mantine theme, palette or tokens; any change to `DEFAULT_MANTINE_THEME` or `variantColorResolver`.
- Custom window buttons; light mode; animations beyond Mantine defaults.

## Decisions

1. **Tailwind + Mantine like mobile.** Add `tailwind.config.ts` (preset `@repo/tailwind-config`, content
   `src/renderer/**` + `../../packages/ui/src/**`) and `postcss.config.js` copied from `apps/mobile`. A
   `globals.css` keeps `@tailwind base` inside `@layer tailwind` (same as web/mobile, so preflight doesn't override
   Mantine) and sets `--mantine-color-body: #161616` and `--mantine-color-text: #D9D9D9` under `dark-root`.
   Alternative: CSS variables in hand-written CSS — rejected, duplicates the preset and diverges from house style.

2. **Font and images ship in the bundle.** Copy `Roboto-Variable.ttf`, `main-logo.png`, `short-logo.png` and
   `game_placeholder.jpeg` from `apps/mobile/public` into `apps/desktop/src/renderer/public` (electron-vite renderer
   public dir). `@font-face` in `globals.css`. CSP needs no change (`default-src 'self'` covers fonts).
   Alternative: load Roboto from Google Fonts — rejected, breaks offline and needs CSP changes.

3. **Covers.** `gameCover(game, size)` in `model.ts` calls `getSizedImageUrl` (new subpath export `@repo/ui/image`
   pointing to `getSizedImageUrl.ts`; desktop already imports `@repo/ui` only by subpath). A `Cover` component
   renders Mantine `AspectRatio ratio={264/354}` + `Image fit="cover"` with `src` = `cover_big`,
   `srcSet` = `cover_big 1x, cover_big_2x 2x`, `fallbackSrc` = placeholder, `loading="lazy"`. Used by grid cards
   (fixed column width ~ 168 px) and the detail pane. Grid row height is computed from the column width instead of
   the constant 290 so rows never clip.
   Alternative: reuse `GameFigureImage` — rejected, it wraps a web `Link` and takes the GameNode game object, not the
   importer item.

4. **App frame: hidden title bar with native overlay controls.** Main window gets `titleBarStyle: "hidden"`,
   `titleBarOverlay: { color: "#262525", symbolColor: "#D9D9D9", height: 48 }`, `backgroundColor: "#161616"`
   (no white flash). The renderer `TopBar` is 48 px, `app-region: drag`, interactive children `no-drag`, right padding
   reserved for the OS controls via `env(titlebar-area-width)`. Contents: menu button (Tabler `IconMenu2`) →
   new preload task `showAppMenu()` → main pops the existing application menu at the button
   (`Menu.getApplicationMenu().popup`); logo; "Library" nav item (active underline in brand); avatar `Menu`
   (Mantine) with username, Manage stores, Sign out. Avatar uses Mantine `Avatar` with initials.
   Alternatives: keep the native frame and menu bar above our top bar — rejected, the Figma Desktop frame has no
   menu bar and two stacked bars waste height; fully custom window buttons — rejected, more code and loses Windows
   snap layouts.

5. **Session exposes the username.** `App.tsx` already fetches the session; it caches `{ userId, name }` in the
   existing `gamenode-identity` entry and passes `user` to `UserLibrary`, so the top bar works offline.

6. **Library split and restyle.** `Library.tsx` keeps state and handlers; presentation moves to small siblings in
   `library/`: `Sidebar.tsx`, `Toolbar.tsx`, `GameCard.tsx` (grid), `GameRow.tsx` (list), `DetailPane.tsx`,
   `StateMessage.tsx`, plus `components/TopBar.tsx` and `components/Cover.tsx`. Styling via Tailwind classes on
   paper tokens; Mantine for Button, TextInput, Menu, Modal, Badge, Loader, Tooltip.
   - Sidebar: `bg-paper-7` panel, section labels "Library" / "Stores" (`text-xs uppercase text-dimmed-1`), items are
     plain buttons `rounded-sm px-sm py-xs`, active `bg-paper-1`, count right-aligned dimmed; store sync shows a small
     Mantine `Loader`, error shows a red `IconAlertTriangle` with a Retry tooltip button. "Manage stores" moves to
     the user menu.
   - Toolbar (in content area): search `TextInput` with `IconSearch`, selection count, grid/list as two
     tag-filter buttons (`variant="filled"` brand when active, `variant="default"` otherwise), primary `Import` button.
   - Grid card: cover with `rounded-sm`; selected → `outline-2 outline-brand`; focused → Mantine focus ring;
     hover → `bg-paper-4`; "In GameNode" Mantine `Badge` (brand `variant="filled"`, size xs) on the cover corner;
     name `text-sm font-medium truncate`; store `text-xs text-dimmed-1`.
   - List: header row `text-xs uppercase text-dimmed-1` with sort chevrons (`IconChevronUp/Down`), 48 px rows with a
     32 px cover thumbnail (`cover_small`), zebra-free, hover/selected same as cards.
   - Detail pane: `bg-paper-7`, cover, title, store/year line, in-library badge, primary Import button, close
     `IconX` action icon.
   - States: `StateMessage` = centered Tabler icon in a `bg-paper-1` circle, title, dimmed text, optional primary
     button. Offline = 32 px bar under the top bar (`bg-paper-1`, `IconCloudOff`, dimmed text). Action errors and
     import results keep their current state but render as a dismissible bar in the same slot (danger `#E5484D`
     text + icon for errors), replacing Mantine `Alert`s that pushed the layout by their height. Mantine
     notifications are not added: the import result already raises a system notification.
   - Splitters: 1 px `bg-paper-4` line with an 8 px hit area, brand on hover/focus.

7. **Sign-in screen.** Centered `bg-paper-1` card (radius md, 400 px), `main-logo.png`, heading, dimmed text,
   provider buttons full width `variant="default"` with `IconBrandGoogle` / `IconBrandDiscord` / `IconBrandX`,
   error as danger text inside the card. Session-restoring and retry states use `StateMessage`.

## Risks / Trade-offs

- [`titleBarOverlay` on Linux depends on the window manager; some Wayland compositors draw it poorly] → verify on
  GNOME/KDE Wayland and X11; if broken, fall back on Linux only to the native frame (top bar stays, menu button still
  works). Behind one `process.platform` check in main.
- [Hidden title bar hides the Windows menu bar; users might not find menu actions] → the menu button and the
  existing renderer shortcuts cover it; accelerators of the application menu keep working while it is set.
- [`cover_big_2x` downloads ~4× bytes] → only on 2× displays via `srcSet`, and only for virtualized visible rows.
- [Tailwind preflight could restyle Mantine] → same `@layer tailwind` ordering web/mobile already ship.
- [`getSizedImageUrl` returns an error string for non-IGDB URLs] → `Cover` treats a non-`https` result as missing
  and shows the placeholder.

## Migration Plan

Apply in the `feature/desktop-client-mvp` worktree after `desktop-shell-owned-library` is complete. Purely
presentational; rollback = revert the commit.
