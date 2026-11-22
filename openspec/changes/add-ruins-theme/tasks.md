# Tasks

## 1. Foundation (wave 1)

- [x] 1.1 `defineTheme` `style` block + generator: style variables with neutral defaults, light-scheme Mantine variables and light `darkDefaults` branch only for `colorScheme: "light"`; `gamenode`/`xbox` generated blocks unchanged.
- [x] 1.2 `themes/ruins.ts` with Figma tokens, radius 0, `screens: "ruins"`, pinned overrides (paper/dark/line/nav/status/tertiary=highlight, ionic surfaces); register in `definitions.ts`; label/description keys in en + pt-BR; `pnpm locales:generate-types`, `pnpm themes:generate`, `pnpm themes:check`.
- [x] 1.3 Theme-driven Mantine color scheme: memory manager + `ThemeColorSchemeSync` in `@repo/ui`; web `_app`, `_document`, pre-paint script; mobile `App.tsx`. Tests updated.
- [x] 1.4 Fonts: web `next/font` Zen Kaku Gothic New + Share Tech Mono (`preload: false`) as `--gn-font-zen` / `--gn-font-share-tech-mono`; mobile `@fontsource` imports.
- [x] 1.5 Tailwind `foreground` token; contrast/catalog tests (`apps/mobile/src/theme/*.test.ts`) cover Ruins (text ≥ 4.5:1 on background/surface, accent-contrast on accent).
- [x] 1.6 `theme/ruins/preferences.ts` (`useRuinsPreferences`) and `ThemePackShell.overlay` slot rendered by web and mobile roots.

## 2. Ruins experience (wave 2, parallel)

- [x] 2.1 Ruins screen pack: CSS for Mantine primitives and `data-slot` hooks (buttons, badges/chips, inputs with block focus, tabs/segmented, switch ON/OFF, checkbox, cards/paper, modal window bar, notifications with accent bar, progress, tooltip, menu/nav items, section titles, game cover sepia); web SSR anchor in `ThemePackStyles`; add the hooks to shared components.
- [x] 2.2 Overlay: paper texture and scanline, honoring preferences and reduced motion.
- [x] 2.3 Boot sequence (web + mobile): timeline, cached-data lines, PENDENTE/OFFLINE, skip, reduced motion, a11y announcement, frequency.
- [x] 2.4 Appearance: Ruins in the Supporter-only Special themes (New badge, description, disclaimer); "Ruins options" section only while Ruins is active.
- [x] 2.5 Dark-assumption cleanup across `packages/ui`, `apps/web`, `apps/mobile` (white text/black surfaces → tokens; artwork overlays stay white).

## 2b. Native splash per theme (generated)

- [x] 2b.1 Theme definition: `overrides.mobile.splashBrand` / `splashLogoInner` (with `splashBackground`), defaults from tokens; catalog `native.splash`.
- [x] 2b.2 `apps/mobile/scripts/native-splash.ts` + `generate-native-splash.ts` (`splash:generate`, `splash:check`, wired into root `themes:generate` / `themes:check`): generated `splash_themes.xml`, `ic_splash_logo_<id>.xml`, `SplashThemes.java`; the hand-written Xbox colors, style and drawable are gone; `SplashPalette` looks themes up through `SplashThemes`.
- [x] 2b.3 `splash-palette.test.ts` checks the generated files against the catalog, the shipped GameNode/Xbox colors and Ruins.
- [x] 2b.4 `useEntrySplashDone` UI hook (default true; mobile via `whenSplashDone`): the Ruins boot waits for the native splash, rendering its paper first frame meanwhile; test in `ruins-boot-sequence.test.tsx`.
- [ ] 2b.5 On a device/emulator: Ruins as the saved theme, cold start shows ink-on-paper splash, then the boot (Android 13+ also for the system splash on the launch after switching).

## 2c. Surface pairs and theme scopes

- [x] 2c.1 Media pair tokens (`overrides.media`, `--gn-media-*`), Tailwind `media` colors and `media-ink`, `MEDIA_BUTTON_STYLE`; `gamenode`/`xbox` pinned to the old literals, Ruins a paper wash with ink text.
- [x] 2c.2 Generator emits `[data-gn-scope="<id>"]` (+ `dark` alias) with the full variable set and Mantine scheme variables; `ThemeScope` in `packages/ui/src/theme` (barrel export).
- [x] 2c.3 Converted `TrendingGamesHero` (CSS module: media pair, accent chip), `TrendingReviewCard`, `GameSelectViewFigure`, `UserPlaytimeItem`, profile banner gradients; Premium, About, landing and the awards share sheet render inside `ThemeScope`.
- [x] 2c.4 Tests: media/accent/text contrast for every registered theme, gamenode/xbox media literals, scope blocks equal root blocks, Mantine dark variables reset inside a dark scope, `ThemeScope`, Tailwind media classes, hero CSS without color literals.
- [x] 2c.5 Browser review in Ruins (axe `color-contrast` + dark-block scan): web Home (trending hero, review carousel), Game, Profile, Daily, Awards, Premium (scoped dark); mobile Home, Explore, Library, Notifications, Game, Profile. GameNode re-checked on Home and Explore. Fixed along the way: the mobile Explore featured card (`TrendingShelf`) now uses the media pair, and the release strip's today dot keeps its filled pair when the day has no releases (all themes).
- [x] 2c.6 Guardrails for new UI: `gamenode/no-hard-coded-colors` errors by default (ui/web/mobile) with `color-baseline.json` and `pnpm colors:check`/`colors:baseline` in each `lint`; named Tailwind palettes and fixed Mantine colors flagged; dev-only `ContrastMonitor` (axe + dark-block, on by default in light themes); Mantine `autoContrast`; catalog contrast test for every theme; AGENTS.md rules.

## 3. Validation (wave 3)

- [x] 3.1 `pnpm lint`, `pnpm type-check`, `pnpm --filter mobile test`, `pnpm themes:check`.
- [x] 3.2 Browser flow on web (`localhost:3000`) as a Supporter: select Ruins → styling, fonts, light scheme, options toggle live, persistence after reload, boot frequency/skip/reduced motion, Home/Game/Library entry/Settings vs Figma; switch back to GameNode with no leftovers.
- [x] 3.3 Browser flow on mobile web (`localhost:3002`, phone viewport): same flow plus Daily, Profile, Feats, Notifications vs Figma.
- [x] 3.4 Changeset for `web` and `mobile`.
