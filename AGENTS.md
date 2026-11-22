## UI colors (web, admin, mobile)

- Colors, radius and fonts come from theme definitions in `packages/ui/src/theme/themes/*.ts` (`defineTheme`). `pnpm themes:generate` writes `packages/ui/src/theme/generated/themes.css` and `catalog.ts`; never edit generated files by hand. Every app imports `@repo/ui/themes.css` once: web/admin after the Mantine styles and before `globals.css`; mobile after the Ionic stylesheets and before `theme/variables.css` and `globals.css`. `:root[data-theme]` scopes the active theme and the default theme also sets plain `:root`.
- `DEFAULT_MANTINE_THEME` (`packages/ui/src/util/theme.ts`) reads `var(--gn-…)`: brand/secondary/tertiary are flat token palettes and `dark-0..9` maps the generated scale. Do not add per-app Mantine color palettes; web/admin only merge a `fontFamily` (`next/font`) and mobile keeps its component classNames/defaults. Admin is pinned to `gamenode`.
- `variant="light"` on brand tokens is handled by `variantColorResolver` in that file; alpha on a CSS variable renders as `color-mix()`. Don't override badge/theme-icon colors with ad-hoc `bg-*`/`c=` props or CSS to "fix" contrast; fix the resolver once.
- Prefer `variant="light"` with the default/brand color, or a stock Mantine color (`gray`, `teal`, …). Don't pass shaded brand colors (`brand.4`) expecting a lighter tone: Mantine's flat palette resolves every shade to `var(--gn-brand)`. For lighter brand tones use the generated Tailwind `brand-0..9` scale.
- Rich HTML (blog articles) uses `prose prose-gamenode`, whose typography palette is token-mapped. `prose-invert` and `prose-slate/gray/…` pin fixed grays and are flagged by the color rule.
- Tailwind palettes in `packages/config-tailwind` point to generated variables: `paper-*`, `surface-*`, `brand-*`/`brand-tint`, `line-*`, `nav-*`, `dimmed-*`, `body`, `text-muted`/`muted`, `accent`, `accent-contrast`, `focus`, `state-*` and `secondary`/`tertiary`. Don't copy hex values into utilities; use these token classes or `var(--gn-…)`.
- Do not add colors that bypass the theme in `packages/ui`, web or mobile, including authored `.css`/CSS Modules: `#hex`, `rgb()`/`hsl()`, Tailwind arbitrary colors, Tailwind named/default-palette utilities (`bg-black`, `text-white`, `from-black`, `text-gray-400`, `bg-zinc-900`, `border-neutral-800`, with variants and opacity), Mantine props with fixed colors (`c="white"`, `bg="black"`, `color="white"`; `dark.*` is token-mapped and fine) and the CSS names `white`/`black` (`color: white`). `transparent`, `currentColor` and `inherit` are fine. The `gamenode/no-hard-coded-colors` ESLint rule and its CSS checker flag them; mark artwork exemptions only with `// theme-exempt: <reason>` (or `/* theme-exempt: <reason> */` in CSS).
- Check every new UI under a dark theme (GameNode) and the light theme (Ruins) before it is done (Settings > Appearance). A surface and the text on it must come from the same token pair: theme surfaces + text tokens (`bg-paper-*`/`bg-surface-*` with `text-body`/`text-muted`, `nav-*`, `panel-*` ...), or the media pair `var(--gn-media-scrim)`/`var(--gn-media-text)` for text over imagery. Never mix a fixed dark surface with theme text (or the reverse). Intentionally dark (or light) artwork such as marketing sections, recap or awards art goes inside `<ThemeScope>` (`data-gn-scope`), which re-applies a theme's whole variable set to the subtree.
- Legacy baseline: the rule is `error` by default in `packages/ui`, `apps/web` and `apps/mobile` (TS/TSX and CSS; admin only warns). Files that already violated it when the rule was flipped are listed in `packages/config-eslint/color-baseline.json` (path -> violation count) and stay `warn`. `pnpm colors:check` (also run by each package's `lint`, so `pnpm lint`/turbo) fails when a file outside the baseline has any violation or a baseline file's count grows; shrinking is fine. After migrating a file, run `pnpm colors:baseline` to lock the progress in (it refuses to record growth). Never edit the JSON by hand and never regenerate it to hide new violations.
- Dev contrast monitor: `ContrastMonitor` (`@repo/ui/theme/dev/contrast-monitor`, mounted in web `_app.tsx` and mobile `App.tsx` behind a dev-only dynamic import, so it never ships) runs axe `color-contrast` plus a "solid dark block in a light theme" check (skips images/video and `[data-gn-scope]`). It is on by default when the active theme's color scheme differs from GameNode's (Ruins); `localStorage.setItem("gn-contrast-monitor", "on" | "off")` forces it. Each offender is warned once in the console as `[gn-contrast] … in <hint>` (nearest `data-slot`, `data-testid` or CSS-module class) and outlined with a dashed danger outline; `window.__gnContrastMonitor.run()` forces a scan. Fix the cause with tokens, not by silencing the monitor.
- Mantine `autoContrast` is on (`luminanceThreshold: 0.179`): filled components on measurable colors (Avatar initials, `color="yellow"`) pick black/white text. It cannot measure `var(--gn-…)`, so brand/secondary/tertiary use the explicit `--gn-<token>-filled-text`/`-light-text` tokens through `variantColorResolver`.
- Adding a theme: create `packages/ui/src/theme/themes/<id>.ts` with `defineTheme` (all tokens, radius, font, optional `experience`/`screens`/`overrides`), register it in `packages/ui/src/theme/definitions.ts`, add its label key to both locale JSON files and run `pnpm locales:generate-types`, then run `pnpm themes:generate` and `pnpm themes:check`. `pnpm --filter mobile test` runs the token/contrast checks. A palette-only theme must not require changes to the generator or to app entries.

# Repository guide

pnpm 10 + Turborepo monorepo. Apps: `apps/web` (Next.js **pages router**, SSR), `apps/admin` (Next.js, port 3001), `apps/mobile` (Vite + Ionic + Capacitor, port 3002). Shared code: `packages/ui` (`@repo/ui`), `packages/wrapper` (`@repo/wrapper`), `packages/locales` (`@repo/locales`), `packages/analytics`, plus `config-*` packages. Next.js here has breaking changes: read `node_modules/next/dist/docs/` before touching Next APIs (see `apps/web/AGENTS.md`).

## Commands

Run from the repo root; filter with `-F <name>` (`web`, `admin`, `mobile`, `@repo/ui`, …).

- `pnpm dev` / `pnpm dev -F web` — dev servers (also runs the locale type watcher).
- `pnpm lint`, `pnpm type-check`, `pnpm build` — all via turbo; `type-check` needs `^build`, so `@repo/wrapper` must be generated first.
- `pnpm wrapper:generate` — regenerate `packages/wrapper/src/{server,search}` from `input/*_swagger.json` (generated files, never hand-edit; update the swagger JSON instead).
- `pnpm locales:generate-types` — regenerates `packages/locales/src/generated` from `en.json`. Run after adding translation keys.
- `pnpm --filter @repo/ui barrels:generate` — rebuilds the `index.ts` barrels in `packages/ui/src` (barrelsby). New files in `ui` must be exported through it.
- Tests: `pnpm --filter mobile test` (vitest, jsdom per-file via `// @vitest-environment jsdom`); single file: `pnpm --filter mobile vitest run path/to/file.test.tsx`. Admin: `pnpm --filter admin test` (jest, `src/**/*.test.ts` only). Release scripts: `pnpm test:releases`. `web` and `@repo/ui` have no test runner; UI hook tests live in `apps/mobile` and import the hook from `packages/ui` by relative path.
- `pnpm changeset` — every PR to `main` needs a changeset (`--empty` to ship nothing); only name apps (`web`/`admin`/`mobile`), never internal packages. See `docs/releases.md`.
- `pnpm mismatches:fix` — syncpack dependency version alignment.

## Architecture

- **Shared UI lives in `@repo/ui`.** It is not transpiled: apps compile it (`transpilePackages` / Vite). Inside it, import via the `#@/…` alias; apps use `@/…` for their own `src`. Feature folders under `components/<feature>/{hooks,view,…}`. Apps' pages are thin: they render a `@repo/ui` view and add `<Head>`/SSR prefetch.
- **Per-app injection.** Framework-specific pieces are replaced at startup through `UIProvider` (`presenters` = replaceable components like `Link`, `Modal`, `DetailsBox`; `hooks` = `useRouter`, `useScrollPosition`, …), typed in `packages/ui/src/context/registry.ts`. In `ui`, use `Link`, `Modal`, `useRouter` from `#@/util` (they resolve through the provider), never `next/link`, `next/router` or Ionic directly. Mobile overrides live in `apps/mobile/src/components/registry.ts`; web/admin wire them in `pages/_app.tsx`. When a view must differ per app, add a presenter key to the registry rather than branching on `PROJECT_CONTEXT.client`.
- **API access.** All server calls go through the generated `@repo/wrapper/server` services (e.g. `DailyService.dailyControllerFindTodayV1()`); `setupWrapper` and `setProjectContext` run once in each app's entry (`_app.tsx` / `App.tsx`).
- **i18n.** `useTranslation` from `@repo/locales`; strings live in `packages/locales/src/translations/json/{en,pt-BR}.json` (keep both in sync), keys are type-checked from `en.json`. No hard-coded user-facing strings in `ui`.
- **Specs.** Larger changes are driven by OpenSpec (`openspec/`, `/opsx:*` commands, skills in `.claude/skills`).

## React Query patterns

- One hook per resource in `components/<feature>/hooks/useX.ts`. Keys are hierarchical arrays, domain first: `["daily", "today", userId]`, `["statistics", "trending", "game", request]`. Include everything the request depends on (user id, locale, DTO) in the key; gate with `enabled` (e.g. `!!userId` from `useUserId()`).
- Query hooks that others invalidate/optimistically update return `ExtendedUseQueryResult` / `ExtendedUseInfiniteQueryResult` (`#@/util`): the query result plus `queryKey` and `invalidate()` (see `usePreferredPlatforms`, `useInfiniteTrendingGames`). Export key builders (`getInfiniteTrendingGamesKey`) when a key is needed outside the hook.
- For pages that SSR-prefetch (web), expose `queryOptions({...})` factories (`blogPostsOptions`) and reuse them in `getServerSideProps` (`prefetchQuery` + `dehydrate`) and in the hook. Dehydrated keys must be JSON-serializable: use `null`, not `undefined`.
- Mutations: `useMutation` with `onError: createErrorNotification` (`#@/util`; logs and shows a red Mantine notification). Optimistic updates follow `onMutate` (cancel → snapshot → `setQueryData`; return snapshot) / `onError` (rollback) / `onSettled` (`invalidate`) — see `useUserLike`, `PreferredPlatformItem`.
- Auth: each app's `QueryClient` routes errors to `handleAuthError` (`QueryCache`/`MutationCache` `onError`). Defaults differ: web uses `staleTime: Infinity` and no refetch triggers, mobile uses `gcTime: Infinity` and `refetchOnMount: true`, so set `staleTime`/`refetchOn*` per query when freshness matters. After sign-in/out, use `signOut(queryClient)` style helpers rather than ad-hoc cache clearing.
- Tests mock the generated service with `vi.spyOn(XService, "method")` and wrap in a `QueryClientProvider` with `retry: false`; mock `useUserId` for auth-dependent hooks.

## Mantine + Tailwind

- Mantine v9 components first (`Stack`, `Group`, `Flex`, `Text`, `Button`, …); Tailwind utilities (`className`, merged with `cn` from `#@/util`) for spacing/layout tweaks and the `bg-paper-*`/`brand-*` scales. Mantine stylesheets must be imported before Tailwind in `_app.tsx`.
- Theme: every app uses `DEFAULT_MANTINE_THEME` from `@repo/ui` (merge only a `fontFamily`). Apps are dark-only (`forceColorScheme="dark"`). Colour rules are in "UI colors" above.
- Notifications via `@mantine/notifications`; modals via the injected `Modal` (`ModalComponentProps`, `BaseModalProps`) so mobile renders an `ion-modal`. Dates via `dayjs`, icons via `@tabler/icons-react`.
- Forms: `react-hook-form` + `zodResolver` with a schema factory taking `t` for translated messages (`PlaytimeSubmitForm`); `@mantine/form` is not used.
- Charts/tables/editor use the matching `@mantine/*` packages (`charts`, `dates`, `tiptap`, `dropzone`, `carousel`, `spotlight`).

## Gotchas

- Mobile is built with the React Compiler (`babel-plugin-react-compiler`); avoid manual memoization unless profiling demands it.
- `better-auth-capacitor` must stay local to `apps/mobile/node_modules`; pnpm hoist patterns exclude it. Use `pnpm --filter mobile sync:native` for Capacitor sync so generated Gradle paths and native fingerprints remain portable.
- Keep the virtual store local (`enableGlobalVirtualStore: false`): Turbopack requires dependencies inside the repository root. Worktrees still share package files through pnpm's content-addressable store.
- Local authenticated browser testing: `docs/local-browser-testing.md` (uses a throwaway session against a local DB only).
