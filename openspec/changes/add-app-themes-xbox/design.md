# Design

## Context

See proposal.md (Why) and the three specs for behavior. Current state that shapes the approach:

- **Palette copies.** Mantine's `brand`/`secondary`/`tertiary` are flat `colorsTuple` hex palettes in `packages/ui/src/util/theme.ts`, with a custom `variantColorResolver` for `variant="light"`. Tailwind (`packages/config-tailwind/tailwind.config.ts`) holds its own hex copies of `paper-*`, `brand-*`, `line-*`, `nav-*` and `textColor`. Ionic colors are hex in `apps/mobile/src/theme/variables.css` (plus `dark.always.css`). Mobile sets a fixed `#1f1f1f` edge-to-edge background in `App.tsx`.
- **Hard-coded colors.** `main` has 566 hex literals in 160 `.tsx` files (293 as `bg-[#…]`/`c="#…"`).
- **Forced dark scheme.** Every app passes `forceColorScheme="dark"`; admin shares `DEFAULT_MANTINE_THEME`.
- **Already on `main`.** `SettingsModal` with `SettingsAppearanceTab` is used by both web (`GlobalAppShell`) and mobile (`App.tsx`). The tab lists Steam/Xbox/PlayStation/Nintendo as disabled "special themes" with a non-affiliation disclaimer.
- **Presenter registry.** `UIPresenterRegistry` (`context/registry.ts`) is the existing mechanism for swapping components per app. Mobile overrides several entries.
- **Web rendering.** Pages router on Next 16. About 26 of 60 pages use `getServerSideProps`/`getStaticProps`; the rest (including `home`) are statically optimized. Adding `App.getInitialProps` would turn every page dynamic.
- **Reference implementation.** Thiago's `feat/settings-modal-themes` has working Xbox/console components, `--gn-*` variables derived with `color-mix`, an anti-flash head script, and a mobile Preferences restore. They are written against a `main` that is 61 commits old, and theme CSS overrides other components' classes globally.

## Goals / Non-Goals

**Goals:**
- Adding a palette-only theme = one definition file + translation keys + `pnpm themes:generate`.
- Adding an experience or theme screens = one lazily loaded folder that touches no shared component's CSS.
- `gamenode` is pixel-identical to today after the foundation lands (verified before Xbox work starts).
- Same mechanism on web and mobile; native values (hex) available to JS for Capacitor plugins.

**Non-Goals:**
- Server-side persistence, account sync, light mode, other store themes, theme sounds.
- Migrating every hex literal in this change. Only accent/brand literals everywhere, plus literals on surfaces the Xbox theme shows. The lint rule prevents new ones, and the rest is tracked as follow-up.
- Theming the admin app.

## Decisions

### 1. Theme definitions are TypeScript objects; CSS is generated

`packages/ui/src/theme/themes/<id>.ts` exports `defineTheme({ id, labelKey, colorScheme: "dark", tokens: {...}, radius, font, experience?, screens?, overrides? })`.

- **Generated output.** `pnpm themes:generate` (a `tsx` script in `packages/ui`) reads every definition and writes, under `packages/ui/src/theme/generated/` (committed, like `packages/locales/src/generated`):
  - `themes.css`: one `:root[data-theme="<id>"]` block per theme (the default also on plain `:root`), with base tokens, derived scales and mapped Mantine/Ionic variables;
  - `catalog.ts`: ids, label keys, experience ids, preview palette, and the native hex values (`background`, `statusBarStyle`) for Capacitor.
- **Derived scales.** Scales (`brand-0..9`, `paper-0..8`, `dark-0..9`, `line`, `nav-*`, Ionic `-rgb`/`-shade`/`-tint`) are computed in OKLCH with `culori` at generation time. `overrides` lets a theme pin any derived value; `gamenode` pins every current hex so its output equals today's values.
- **Checks.** A unit test (mobile vitest, which imports `packages/ui` by path as UI hook tests already do) checks token completeness and WCAG contrast for every theme. CI runs the generator and fails on a git diff.
- *Alternatives:*
  - Hand-written CSS per theme, as on Thiago's branch: no type safety, no contrast check, and Capacitor needs hex in JS anyway.
  - Runtime `color-mix()` derivation: no hex for native or Ionic `-rgb`, and harder to pin `gamenode` exactly.
  - Computing at runtime in JS and injecting a `<style>`: ships the color library and needs an injection point before paint on both apps.

### 2. One mapping from tokens to Mantine, Ionic and Tailwind

- **Mantine.** `DEFAULT_MANTINE_THEME` uses `colors.brand/secondary/tertiary/dark` tuples of `var(--gn-…)`, plus `fontFamily: var(--gn-font)` and `defaultRadius`. Mantine's `rgba()` already handles `var(...)` via `color-mix`. `variantColorResolver` keeps its single fix, now token-based; `theme-variant-colors.test.ts` is updated to expect `color-mix(... var(--gn-brand) ...)`.
- **Tailwind.** Every palette entry in `config-tailwind` points to a `var(--gn-…)`, and new semantic names are added (`surface-*`, `text-muted`, `accent`, `accent-contrast`, `focus`). Existing class names keep working.
- **Ionic.** `--ion-color-primary*`, `--ion-background-color`, `--ion-toolbar-background`, `--ion-tab-bar-background`, `--ion-item-background` and `--ion-text-color` come from the generated CSS. `apps/mobile/src/theme/variables.css` keeps only non-themed Ionic settings.
- The generated stylesheet is imported once per app, after Mantine and before Tailwind (same slot as today's global CSS). `:root[data-theme]` specificity beats Mantine's and Ionic's `:root` defaults.

### 3. Color hygiene via a custom ESLint rule

- **Rule.** A local rule in `packages/config-eslint` (`gamenode/no-hard-coded-colors`) flags hex, `rgb()`/`hsl()` literals in JSX props and style objects, and Tailwind arbitrary color classes (`bg-[#…]`, `text-[rgb(…)]`).
- **Exemptions.** An exemption comment (`// theme-exempt: <reason>`) is allowed only for artwork (recap/awards/wrapped canvases, platform brand marks, game art overlays).
- **Rollout.** The rule is `error` in files touched by this change and `warn` repo-wide until the follow-up migration finishes. The scoping uses ESLint `overrides`, driven by a checked-in list that shrinks over time.
- *Alternative:* a grep in CI. Rejected: no autofix hints and no exemption syntax.

### 4. Experiences and theme screens are lazy presenter packs

- **Registry.** `packages/ui/src/theme/experiences/registry.ts` maps an experience id to `() => import("./console")`, and a theme's screen pack to `() => import("../themes/xbox/screens")`. Each module exports `{ presenters: Partial<UIPresenterRegistry>, shell?: ShellSlots }` and imports its own CSS Modules.
- **Merge order.** `AppThemeProvider` resolves the active theme's packs and merges presenters as `{ ...experience, ...themeScreens, ...appPlatformPresenters }`. Platform presenters win, as in Thiago's `useThemePresenters`, so Ionic adaptations survive.
- **New registry keys.** `GameInfoView`, `ProfileUserInfoWithBanner`, `ProfileViewNavbarItem`, `ProfileStatsSimpleOverview`, `ProfileStatsView`, `RecentBlogPostsCarousel`, `HomeReleases`, `HomeView` (console home), `ExploreTrendingGames`, `PostsListItem`, `PostsFeedView`, `NotificationsPanel`. Pages render the registry key instead of branching on `isConsole`. `HomeView`'s default composes today's home sections per app, so the home pages pass their app-specific sections in as props/slots.
- **Web shell.** `GlobalAppShell` lives in `apps/web`, so the console header and bottom nav cannot be `@repo/ui` presenters without pulling web-only pieces. The shell instead reads `useAppExperience()` (`"default" | "console"`) and swaps its own header/navbar layout. The console header and bottom nav are web components that compose existing web pieces (CommandCenter, notifications, user menu). This is the single sanctioned branch on experience id. It is cheap because the web shell has exactly two layouts.
- **Styles.** No theme CSS targets another component's classes. Shared components that themes restyle expose `data-slot`/`classNames` hooks, and console/Xbox components use CSS Modules + Tailwind tokens. Thiago's `base.css`/`xbox/theme.css` are split into per-component modules during the port.
- *Alternatives:*
  - `next/dynamic`: web-only, and `@repo/ui` must stay framework-agnostic.
  - Eager import as on the branch: every user downloads the Xbox screens.
  - Per-theme Mantine theme objects: forbidden by AGENTS.md, and they don't cover layout.

### 5. Runtime, persistence and anti-flash

- **Provider and storage.** `AppThemeProvider` (`@repo/ui`) owns the state and takes a `ThemeStorage` adapter (`get(): string | null` sync, `set(id)`), injected through `UIHookRegistry` as `themeStorage`.
  - Web adapter: writes the cookie `gn-theme` (1 year, `SameSite=Lax`, path `/`, host-only so admin is unaffected) and mirrors it to `localStorage`.
  - Mobile adapter: writes Capacitor Preferences and mirrors to `localStorage` for synchronous reads.
  - Invalid ids resolve to `gamenode`.
- **Web pre-paint.**
  - `_document` gets a `getInitialProps` that reads `gn-theme` from `ctx.req` when present (dynamic pages) and renders `<Html data-theme=… data-theme-ssr=…>`. This does not affect Automatic Static Optimization (only `App.getInitialProps` does).
  - `enhanceApp` passes the same value to `_app` as `initialTheme`, so dynamic pages SSR the right experience.
  - An inline head script (from the catalog) sets `data-theme` from the cookie/localStorage on static pages and also sets `<meta name="theme-color">`.
- **Hydration.**
  - The provider's first client render uses `data-theme-ssr` (the value the server rendered with). It then switches to the stored theme in an effect, avoiding hydration mismatches.
  - On static pages a console user therefore gets correct colors immediately. For the layout, a CSS rule hides `main` content while `html[data-experience-pending]` is set, for at most ~300 ms or until the experience mounts.
- **Experience preload.** The head script/`main.tsx` sets `data-experience` and starts `import()` of the experience chunk before React renders when the stored theme needs one.
- **Mobile pre-render.** `main.tsx` awaits Preferences + the experience preload (bounded by a short timeout), then renders. This keeps Thiago's approach, plus the chunk preload.
- **Native chrome.** A `useNativeThemeChrome` hook in `apps/mobile` applies the catalog's hex to `EdgeToEdge.setBackgroundColor` and `StatusBar.setStyle` on start and on change. It replaces the fixed `#1f1f1f`.
- **Admin.** No adapter and no provider state: it always uses `gamenode`. The admin app keeps importing the generated CSS for the default variables.
- *Alternatives:*
  - `App.getInitialProps` for the cookie: makes all 34 static pages dynamic.
  - localStorage-only: dynamic pages would SSR the wrong layout.

### 6. Fonts

- Xbox uses the system `Segoe UI Variable`/`Segoe UI` stack, then Inter, then Roboto.
- Web loads Inter via `next/font` with `preload: false` and exposes it as `--gn-font-inter`. Only Xbox references it, so it is fetched only when used.
- Mobile bundles nothing new and falls back to Roboto (Inter via `@fontsource` only if design asks for it later).

### 7. Porting Thiago's work

- **Port, don't merge.** Port component by component from `origin/feat/settings-modal-themes` onto current `main`, adapting to the redesigned home, explore, blog cards, library tabs and the mobile sidebar/tab bar.
- **Data access.** Each ported screen reuses the same hooks and actions as its default counterpart (no new queries), per the "same data and actions" requirement.
- **Leftovers.** The debug-user, Daily, wrapped share-panel and settings-modal changes on those branches are not part of this change.
- **Dropped assets.** Theme sounds, `/sfx/*.mp3` and console logos are dropped.

## Risks / Trade-offs

- **Lazy screens on SSR.** Lazy screens under SSR may suspend or mismatch → render experience packs inside `Suspense`; the server awaits them on dynamic pages (React 19 SSR supports `lazy`), and the client keeps server HTML until the chunk loads. Covered by a task that verifies Xbox on an SSR page (game page) with JS throttled.
- **Static web pages.** Static pages show the default layout briefly before the console one → hidden-until-ready gate with a short cap. Colors are already right, so the worst case is a short blank `main`, not a wrong-colored flash.
- **`gamenode` regression.** The token refactor could alter `gamenode` → pin all values via `overrides`. Take before/after screenshots of key pages (home, game, profile, settings, mobile home) and diff them before starting Xbox work.
- **Ported screens drifting from defaults.** Ported Xbox screens drift from default ones as features evolve → they reuse hooks and child components (actions, follow, edit) instead of copying logic. A test per screen asserts the same actions render.
- **Large port size.** The full Thiago scope (~10 screens + console home/shell) is large → tasks are ordered so foundation and `gamenode` parity land first and can ship behind the disabled picker. The Xbox option is enabled only when all its screens are done.
- **Lint noise.** The lint rule produces noise on untouched files → `warn` outside the migrated set. The set grows in follow-ups.
- **Trademark.** Using "Xbox" as a label → no logos or sounds, and the existing disclaimer stays. Revisit naming if legal asks.
- **AGENTS.md drift.** AGENTS.md says the brand palette is a flat `#F15025` → update the "UI colors" section to describe tokens and the generator.

## Migration Plan

1. **Foundation.** Land the foundation (definitions, generator, mappings, provider, storage, lint rule) with only `gamenode`. The picker stays disabled. Verify zero visual diff.
2. **Colors.** Migrate accent/brand literals repo-wide and the surface literals on the Xbox-covered screens.
3. **Experience and screens.** Land the `console` experience and the Xbox screen pack behind the still-disabled option. Developers can test with `?theme=xbox` (dev builds only).
4. **Enable.** Turn on the Xbox option in Appearance and ship a changeset for `web` and `mobile`.
5. **Rollback.** Disable the Xbox option in the catalog. Stored `xbox` values fall back to `gamenode` automatically.

## Open Questions

- Should Inter be bundled on mobile for Xbox (Android has no Segoe)? This doesn't change the approach; it is decided during visual review.
- Exact cap for the static-page layout gate (default 300 ms), tuned after measuring chunk load on production.
