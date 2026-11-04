## UI colors (web, admin, mobile)

- Mantine's `brand`, `secondary` and `tertiary` are flat `colorsTuple` palettes in `packages/ui/src/util/theme.ts`: every shade is the same color. Do not add per-app Mantine themes or palettes; all apps use `DEFAULT_MANTINE_THEME`.
- `variant="light"` on brand colors is handled by `variantColorResolver` in that file. Don't override badge/theme-icon colors with ad-hoc `bg-*`/`c=` props or CSS to "fix" contrast; fix the resolver once.
- Prefer `variant="light"` with the default/brand color, or a stock Mantine color (`gray`, `teal`, …). Don't pass shaded brand colors (`brand.4`) expecting a lighter tone: they are all `#F15025`. For lighter brand tones use the Tailwind `brand-0..9` scale.

# Repository guide

Yarn 1 + Turborepo monorepo. Apps: `apps/web` (Next.js **pages router**, SSR), `apps/admin` (Next.js, port 3001), `apps/mobile` (Vite + Ionic + Capacitor, port 3002). Shared code: `packages/ui` (`@repo/ui`), `packages/wrapper` (`@repo/wrapper`), `packages/locales` (`@repo/locales`), `packages/analytics`, plus `config-*` packages. Next.js here has breaking changes: read `node_modules/next/dist/docs/` before touching Next APIs (see `apps/web/AGENTS.md`).

## Commands

Run from the repo root; filter with `-F <name>` (`web`, `admin`, `mobile`, `@repo/ui`, …).

- `yarn dev` / `yarn dev -F web` — dev servers (also runs the locale type watcher).
- `yarn lint`, `yarn type-check`, `yarn build` — all via turbo; `type-check` needs `^build`, so `@repo/wrapper` must be generated first.
- `yarn wrapper:generate` — regenerate `packages/wrapper/src/{server,search}` from `input/*_swagger.json` (generated files, never hand-edit; update the swagger JSON instead).
- `yarn locales:generate-types` — regenerates `packages/locales/src/generated` from `en.json`. Run after adding translation keys.
- `yarn workspace @repo/ui barrels:generate` — rebuilds the `index.ts` barrels in `packages/ui/src` (barrelsby). New files in `ui` must be exported through it.
- Tests: `yarn workspace mobile test` (vitest, jsdom per-file via `// @vitest-environment jsdom`); single file: `yarn workspace mobile vitest run path/to/file.test.tsx`. Admin: `yarn workspace admin test` (jest, `src/**/*.test.ts` only). Release scripts: `yarn test:releases`. `web` and `@repo/ui` have no test runner; UI hook tests live in `apps/mobile` and import the hook from `packages/ui` by relative path.
- `yarn changeset` — every PR to `main` needs a changeset (`--empty` to ship nothing); only name apps (`web`/`admin`/`mobile`), never internal packages. See `docs/releases.md`.
- `yarn mismatches:fix` — syncpack dependency version alignment.

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
- `better-auth-capacitor` is `nohoist`; do not hoist it.
- Local authenticated browser testing: `docs/local-browser-testing.md` (uses a throwaway session against a local DB only).
