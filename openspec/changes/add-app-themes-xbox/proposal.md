# Proposal

## Why

The Appearance tab already advertises store-inspired themes, but GameNode has no theming system behind it: colors are hard-coded (566 hex literals across 160 `.tsx` files on `main`), Mantine, Ionic and Tailwind each own a separate copy of the palette, and every app forces one dark look. Thiago's `feat/app-themes` / `feat/settings-modal-themes` branches proved the product idea (Xbox console look, theme picker, no-flash restore on web and mobile), but they couple palette, layout, component overrides and sounds into one concept. Their themes are also global CSS overrides (≈2,200 lines for Xbox alone) aimed at other components' classes. Adding or changing a theme there touches about six places, and the branches are 61 commits behind `main`. We want a foundation where a new palette is one typed file and a new layout is an isolated, lazily loaded package, and we want to prove it end to end with one complete theme: Xbox.

## What Changes

- **Theme definitions as typed tokens.** Each theme is one `defineTheme()` file in `@repo/ui` with semantic color tokens (background, surfaces, text, muted text, border, accent, accent contrast, focus, status colors), radius and font, plus metadata (label key, preview, optional experience). A generator (`pnpm themes:generate`) emits the per-theme CSS variables, the derived scales, and the theme list. A test enforces complete tokens and minimum contrast.
- **A single token mapping layer.** Generated variables feed Mantine (`brand`, `dark-*`, body, fonts, radius), Ionic (`--ion-*`, including `-rgb`, toolbar and tab bar) and Tailwind (`paper-*`, `brand-*`, `line-*`, `nav-*`, `dimmed`, `body`, plus new semantic utilities). The default `gamenode` theme must render identically to today.
- **Color hygiene.** An ESLint rule rejects new hex and `rgb()` literals in `packages/ui` and the apps (with explicit exemptions such as game art and recap/awards artwork). Literals on the surfaces the Xbox theme covers, and every accent/brand literal, are migrated to tokens.
- **Experiences (layouts) as a separate layer.** A theme may opt into an experience. The first one is `console`: a console web shell with a top header and a bottom navigation on narrow screens, and a console home with a hero backdrop/trailer, focusable tile rows, a review row, releases and a blog section. An experience provides presenters and its own CSS Modules and is loaded on demand, so users of other themes do not download it.
- **Xbox theme (MVP, full scope).** Xbox palette (black and green), the console experience, and Xbox screens for activity items, game page, profile (gamercard), profile stats, posts feed and items, recent blog posts, explore, home releases and the notifications panel, ported from Thiago's branch onto current `main` and the new structure.
- **Theme runtime.** An `AppThemeProvider` with a storage adapter injected per app. Web uses a cookie (so SSR renders `data-theme`) with an inline head script fallback. Mobile uses Capacitor Preferences restored before first render. On mobile, theme changes also drive the native chrome (status bar, Android edge-to-edge background); on web they set `<meta name="theme-color">`. The selection is per device.
- **Appearance tab.** The existing "Special themes" section becomes functional for Xbox. Other store themes stay listed but disabled, and Light/System stay disabled.
- Not in scope: server-side persistence of the choice, light mode, and the PlayStation/Switch/Steam themes. Official logos and startup sounds also stay out; the existing "not affiliated" disclaimer remains.

## Capabilities

### New Capabilities
- `app-theming`: theme definitions and tokens, generated styles for Mantine, Ionic and Tailwind, theme selection and per-device persistence without flashes, native chrome sync, the Appearance picker, and the hard-coded color guard.
- `app-theme-experiences`: how a theme opts into an alternative layout (experience), how experiences replace shared components and app shell parts, and how they are loaded on demand; includes the `console` experience behavior on web and mobile.
- `xbox-theme`: the Xbox theme's palette and the Xbox-specific screens (home, explore, game page, profile, stats, posts, activity, blog, notifications) on web and mobile.

### Modified Capabilities
<!-- None: no existing spec (achievement-authoring, blog-editorial-access, blog-reading, notification-inbox, platform-achievements) changes requirements. -->

## Impact

- **packages/ui**: new `src/theme/` (definitions, generator output, provider, hooks, experiences); `util/theme.ts` Mantine theme reads CSS variables; `context/registry.ts` gains presenter keys for themable views (`GameInfoView`, `ProfileUserInfoWithBanner`, `ProfileStatsSimpleOverview`, `ProfileStatsView`, `RecentBlogPostsCarousel`, `HomeReleases`, `ExploreTrendingGames`, `PostsListItem`, `PostsFeedView`, `ProfileViewNavbarItem`); `settings/tabs/SettingsAppearanceTab.tsx`; colour literal migration in many components.
- **packages/config-tailwind**: palette entries point to CSS variables.
- **packages/config-eslint**: new no-hard-coded-colors rule.
- **packages/locales**: theme labels and console/Xbox strings in `en.json` and `pt-BR.json`.
- **apps/web**: `_document.tsx` (cookie-based `data-theme`, head script), `_app.tsx` (provider, fonts, presenters), `GlobalAppShell` (console shell), home/explore/posts pages switching via presenters instead of `isConsole` branches.
- **apps/mobile**: `main.tsx` (restore before render), `App.tsx` (provider, presenters, native chrome sync replacing the fixed `#1f1f1f` edge-to-edge color), `theme/variables.css` (Ionic tokens become generated), home page.
- **apps/admin**: consumes the new Mantine theme but stays on `gamenode` with no picker.
- **Dependencies**: a build-time color library for scale and contrast computation (e.g. `culori`), dev-only.
- **Source branches**: `feat/app-themes` and `feat/settings-modal-themes` serve as reference implementations to port from, not to merge. Their unrelated work (Daily UI, debug user, settings modal) is either already on `main` or out of scope.
