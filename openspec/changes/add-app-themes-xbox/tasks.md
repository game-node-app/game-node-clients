# Tasks

Reference implementation for porting: `origin/feat/settings-modal-themes` (Thiago). Port files onto current `main`; do not merge the branch.

## 1. Theme definitions and generator

- [x] 1.1 Add `culori` (dev dependency of `@repo/ui`) and `tsx` if missing, run `pnpm mismatches:fix`, and verify `pnpm install` and `pnpm --filter @repo/ui type-check` pass.
- [x] 1.2 Create `packages/ui/src/theme/defineTheme.ts` with the token schema (background, surface, text, textMuted, border, accent, accentContrast, focus, success, warning, danger), `radius`, `font`, `labelKey`, `colorScheme`, optional `experience`, `screens` and `overrides`; verify a definition missing a token fails `tsc`.
- [x] 1.3 Add `themes/gamenode.ts` pinning every current value through `overrides`: Mantine brand/secondary/tertiary/dark, Tailwind `paper-*`, `brand-*`, `line-*`, `nav-*`, `dimmed`, text color, and Ionic colors from `apps/mobile/src/theme/variables.css`. Verify every pinned value matches its current source.
- [x] 1.4 Write `packages/ui/scripts/generate-themes.ts` (+ `themes:generate` scripts in `@repo/ui` and the root) emitting `src/theme/generated/themes.css` (base tokens, OKLCH-derived scales, Mantine/Ionic/Tailwind variables per `:root[data-theme]`, default also on `:root`) and `catalog.ts` (ids, label keys, experience, preview palette, native hex, status bar style). Verify that running it twice produces no diff.
- [x] 1.5 Add a vitest test in `apps/mobile` (importing `packages/ui` by path) asserting token completeness and WCAG AA contrast (text/background 4.5:1, accent/accentContrast and focus/background 3:1) for every catalog theme, and verify it passes for `gamenode`.
- [x] 1.6 Add a CI/turbo check that runs `themes:generate` and fails on a git diff, and verify it fails after editing a definition without regenerating.

## 2. Styling layer mapping and `gamenode` parity

- [x] 2.1 Point `DEFAULT_MANTINE_THEME` (`packages/ui/src/util/theme.ts`) to `var(--gn-…)` tuples for brand/secondary/tertiary/dark, font and radius, keeping `variantColorResolver` token-based. Update `apps/mobile/src/components/theme-variant-colors.test.ts` to the new expected values and verify it passes.
- [x] 2.2 Point every palette entry in `packages/config-tailwind/tailwind.config.ts` to generated variables and add the semantic names (`surface-*`, `text-muted`, `accent`, `accent-contrast`, `focus`). Verify `pnpm build -F web` and `-F mobile` succeed and a sample of existing classes (`bg-paper-0`, `text-brand-5`, `border-line`) resolves to variables.
- [x] 2.3 Import the generated `themes.css` in web, mobile and admin entries in the documented order (after Mantine, before Tailwind/globals). Move the themed Ionic variables out of `apps/mobile/src/theme/variables.css`, and verify Ionic primary/toolbar/tab bar render the same.
- [ ] 2.4 Capture before/after screenshots (web: home, game, profile, settings Appearance, blog; mobile: home, game, sidebar, tab bar) and verify `gamenode` has no visible differences. Attach the comparison to the PR.
- [x] 2.5 Update the "UI colors" section of `AGENTS.md` (tokens, `defineTheme`, `themes:generate`, no literals, how to add a theme), and verify the documented commands run as written.

## 3. Color hygiene

- [x] 3.1 Implement the `gamenode/no-hard-coded-colors` ESLint rule in `packages/config-eslint` (hex/`rgb()`/`hsl()` in JSX props and style objects, Tailwind arbitrary color classes, `// theme-exempt: <reason>` escape) with RuleTester tests, and verify the tests pass.
- [x] 3.2 Enable the rule as `warn` repo-wide and `error` for the migrated file list (checked-in, initially the files touched by this change), and verify `pnpm lint` passes and reports warnings elsewhere.
- [x] 3.3 Migrate every brand/accent literal (`#F15025` and its shades, `rgba(241, 80, 37, …)`) across `packages/ui`, web and mobile to tokens. Verify `git grep -i "f15025"` only returns the `gamenode` definition and exempt artwork, and that screenshots from 2.4 are unchanged.
- [x] 3.4 Migrate surface/text/border literals in the components rendered by the screens listed in the `xbox-theme` spec (shell, home sections, game page, profile, stats, posts, activity, blog cards, notifications, settings). Mark artwork exemptions, add those files to the `error` list, and verify lint passes and `gamenode` screenshots are unchanged.

## 4. Theme runtime and persistence

- [x] 4.1 Add `AppThemeProvider`, `useAppTheme()` (`[theme, setTheme]`) and `useAppExperience()` in `packages/ui/src/theme/`. Add `themeStorage` to `UIHookRegistry` and fall back to `gamenode` for invalid ids. Verify with vitest tests: default, set and persist via a fake storage, invalid stored value, and `data-theme`/`data-experience` updates on `<html>`.
- [x] 4.2 Add the web storage adapter (cookie `gn-theme`, 1 year, `SameSite=Lax`, host-only, path `/`, mirrored to localStorage) and wire the provider in `apps/web/src/pages/_app.tsx`. Verify in the browser that switching sets the cookie and survives reload.
- [x] 4.3 Read `gn-theme` in `_document`, pass it to `_app` via `enhanceApp`, and emit the matching browser tint without waiting on auth or billing. Verify the cookie controls the server-rendered theme and preserve static optimization.
- [x] 4.4 Restore the saved theme before the background Supporter check. Verify slow or failed status checks leave the theme and interface visible, confirmed loss of access returns the app to GameNode, and SSR and static pages hydrate cleanly.
- [ ] 4.5 Restore Capacitor Preferences mirrored to localStorage and preload the saved layout on mobile without waiting for authentication or billing. The mounted provider checks eligibility. Verify the restore in vitest and with a cold start on Android.
- [ ] 4.6 Add `useNativeThemeChrome` in `apps/mobile` (EdgeToEdge background + StatusBar style from the catalog on start and on change), replacing the fixed `#1f1f1f`. Verify with a vitest test mocking the plugins and on an Android device that bars change without restart.
- [x] 4.7 Keep admin on `gamenode` (no storage adapter, provider pinned). Verify admin renders the default theme with an `xbox` cookie on the web domain.

## 5. Experience layer

- [x] 5.1 Add registry keys `GameInfoView`, `ProfileUserInfoWithBanner`, `ProfileViewNavbarItem`, `ProfileStatsSimpleOverview`, `ProfileStatsView`, `RecentBlogPostsCarousel`, `HomeView`, `HomeReleases`, `ExploreTrendingGames`, `PostsListItem`, `PostsFeedView` and `NotificationsPanel` to `UIPresenterRegistry`, with today's components as defaults. Make web/mobile pages render through them, and verify `gamenode` screenshots from 2.4 are unchanged and type-check passes.
- [x] 5.2 Add the experience/screens registry with lazy `import()` loaders and the presenter merge order (experience → theme screens → app platform presenters) in `AppThemeProvider`, rendered inside `Suspense` with the current screen kept while loading. Verify with vitest tests: merge precedence, loading state, and fallback to default presenters when the import rejects.
- [ ] 5.3 Verify the bundle split: with `gamenode`, the web home network log and mobile build output contain no console/Xbox chunk or stylesheet. Record the check in the PR.
- [x] 5.4 Verify lazy screens under SSR: with the Xbox cookie and JS throttled, the web game page server-renders the Xbox layout and hydrates without mismatch warnings.

## 6. Console experience

- [x] 6.1 Port `ConsoleGameRow`, `consoleRowNavigation` and `gameArt` into `packages/ui/src/theme/experiences/console/` with CSS Modules + tokens (from `base.css` tile/row/shortcut rules). Verify with a vitest test that arrow keys move focus within a row and that rows scroll the focused tile into view.
- [x] 6.2 Port `ConsoleHome` (hero backdrop, trailer after the settle delay, rows: recommendations when signed in, playtime/recent, trending; search under the hero row) and `ConsoleReviewRow` as the console `HomeView`, adapted to current `main` home sections. Verify with component tests: signed-out omits account rows, reduced motion disables the trailer, and focusing a tile updates the hero.
- [x] 6.3 Port `ConsoleBlogSection`, `ConsoleExplore`, `ConsoleReleases`, `ConsoleReleaseStrip` and `ConsoleReleaseCalendar` as console presenters for `RecentBlogPostsCarousel`, `ExploreTrendingGames` and `HomeReleases`. Verify with component tests for the week timeline grouping (reuse Thiago's `release-calendar.test.ts`), calendar open, and explore best-rated cards.
- [x] 6.4 Build the web console shell in `apps/web` (`GlobalShellConsoleHeader`, bottom nav below `md` with safe-area padding, side navbar hidden, see-through header until scroll) switched by `useAppExperience()` in `GlobalAppShell`. Verify in the browser on desktop and at 375 px: the header shows profile/level or sign-in, the bottom nav doesn't cover the page end, and nothing scrolls horizontally.
- [ ] 6.5 Restyle the mobile tab bar and side menu through tokens only (no structural change). Verify on Android that tab bar, side menu and back navigation behave as on `gamenode`.
- [x] 6.6 Add console strings to `en.json` and `pt-BR.json`, run `pnpm locales:generate-types`, and verify both files have the same keys.

## 7. Xbox theme

- [x] 7.1 Add `themes/xbox.ts` (near-black background/surfaces, white text, grey muted, green accent/focus, 4px radius, `Segoe UI Variable`/`Segoe UI` → Inter → Roboto, `experience: "console"`, `screens: xbox`), regenerate, and verify the contrast test passes for Xbox.
- [x] 7.2 Load Inter via `next/font` with `preload: false` on web, exposed as `--gn-font-inter`. Verify no Inter or Segoe font request happens on `gamenode`, and that Inter is requested on Xbox only when Segoe is unavailable.
- [x] 7.3 Port `XboxActivityItem` and `XboxRecentBlogPostsCarousel` (same-size tiles) with CSS Modules. Verify with component tests that activity items link to the same targets as the default `ActivityItem` and that blog tiles open the article.
- [x] 7.4 Port `XboxGameInfoView` + `XboxGameScore` onto the current `GameInfoView` (reusing `GameInfoActions` and the fact-sheet children). Verify with component tests: the strip is omitted without screenshots, the cover fallback without art, library actions present, and autoplay paused under reduced motion.
- [x] 7.5 Port `XboxProfileView` (gamercard), `XboxProfileViewNavbarItem` (pill tabs with counts) and `XboxProfileStats` (headline strip + backlog meter). Verify with component tests: edit appears only on one's own profile, follow actions match the default profile, and a hidden library hides the same data.
- [x] 7.6 Port `XboxProfileStatsView` + `XboxStatsRanking` (games per year line chart with pill tabs, ranked distribution bars with finished share). Verify with a component test that each distribution renders sorted bars sized against its largest entry.
- [x] 7.7 Port `XboxPostsFeedView` and `XboxPostsListItem` (pill tabs, side column on wide screens, create button, comment/like/share). Verify with component tests that create opens the post editor and like/comment/share behave as in `PostsListItem`.
- [x] 7.8 Implement the Xbox `NotificationsPanel` look (from commit `574ffa3b`) on the web notifications panel. Verify in the browser that opening, reading and actions work as on `gamenode`.
- [x] 7.9 Add the Xbox focus/selected ring (green, inside clipping containers) to tiles, cards, tabs and buttons via tokens. Verify keyboard navigation on web home, explore and game page shows a visible ring with 3:1 contrast.
- [ ] 7.10 Verify mobile parity at phone width on Android: every Xbox screen (home, explore, game, profile, stats, posts, activity) has no horizontal scroll, and modals/actions open as native mobile modals.

## 8. Appearance settings

- [x] 8.1 Drive `SettingsAppearanceTab` from the catalog. Dark (`gamenode`) is available to everyone and Xbox requires verified Supporter status. Show a Supporter badge on locked Xbox and use token preview palettes. Keep PlayStation, Nintendo, Steam, Light and System disabled and keep the disclaimer. Verify with component tests that Supporters can select Xbox and see the current badge, and accounts without confirmed access cannot select Xbox.
- [x] 8.2 Add/adjust theme label strings in `en.json` and `pt-BR.json`, run `pnpm locales:generate-types`, and verify type-check passes.

## 9. Integration and release

- [ ] 9.1 End-to-end check on web (Chrome desktop + mobile viewport) and Android. Select Xbox in settings, then reload or restart: the theme persists, there is no flash, and native bars, `theme-color`, all Xbox screens and keyboard focus behave as specified. Switch back to Dark and verify `gamenode` is fully restored.
- [x] 9.2 Run `pnpm lint`, `pnpm type-check`, `pnpm build`, `pnpm --filter mobile test` and `pnpm --filter admin test`, and verify all pass.
- [x] 9.3 Add a changeset naming `web` and `mobile`, and verify `pnpm changeset status` lists it.

## Workflow follow-up

- Follow-up changes: migrate the remaining hex literals and flip the lint rule to `error` repo-wide; add PlayStation/Switch/Steam themes; light mode; server-side persistence.
- Let Thiago know the theme branches are superseded once this lands.
- Archive the change after review and release.
