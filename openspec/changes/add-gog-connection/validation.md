# Validation — add-gog-connection

## Automated checks

- Refreshed Swagger from the sibling server and ran `yarn wrapper:generate`. Reviewed the generated diff: GOG values are additive; existing provider values, exports, playtime source and category 5 remain. The current server contract also adds `GameVideo` and `Game.videos`; these generated additions are retained.
- Mobile Vitest: **133 tests passed across 12 files** in the focused provider/presentation/auth, importer/entries/playtime, privacy/network masking, notification and GOG achievement suites. Only fake authorization values are used in fixtures.
- Admin: `yarn workspace admin test --runInBand getExternalLookupUrl.test.ts` — 7 tests passed. The existing match form still starts with an empty URL for category 5, requires a supplied valid URL, preserves category/source identity and handles conflicts.
- Type checks passed for wrapper, UI, locales, web, mobile and admin. Analytics was also checked; its existing failure is documented below.
- ESLint checked all touched client TypeScript sources and tests in UI, analytics, mobile and admin. No new lint errors. `openspec validate add-gog-connection --strict` passed, as did `git diff --check`.

Covered behavior includes the full callback payload and encoding, local URL rejection, single-use recovery after server/network failures, reconnect preferences, existing settings/deletion APIs and visible ownership errors, safe errors/cache dehydration/network recording, generated provider coverage, noninteractive profile icons, unplayed PC imports, batch results/cache invalidation, localized discovery samples/counts, cumulative playtime without invented metadata, GOG achievement matching within source, hidden text/missing dates, count summaries and retryable read failures with retained cached progress. Steam, PSN, Xbox, Epic and Nintendo regression cases remain covered.

## Pre-existing checks

Analytics has no type-check script. Running `yarn workspace @repo/analytics exec tsc --noEmit` reports six TS2307 errors for shared UI CSS module declarations: SignIn (two imports), FloatingLabelInput, LibraryViewSidebarCollection, McpGuideScreen and RecapYearTitle. A TypeScript compiler-host comparison using HEAD versions of the changed sources in memory produced the same six diagnostics for the baseline and current sources, with no new diagnostics. No unrelated configuration change was made.

UI lint retains the existing React Hook Form `watch` / React Compiler incompatibility warning in PreferencesConnectionSetup. Linting the HEAD version confirms the same warning. The test harness also emits its existing React act deprecation and browser-mapping age warnings.

## Required manual checks still open

- Task 5.2: no authenticated GOG account/server session was supplied for this run. Real sign-in/exchange, expiry, resumed eligible sync after reconnect, collection ownership enforcement, owned/unplayed imports, cumulative playtime and owner/public achievement reads remain unverified against a live GOG-capable server. Mocked client tests do not complete this task.
- Task 5.3: no real desktop/mobile browser-copy session or iOS/Android hardware was available. No OS/browser combination is claimed as validated; unsupported combinations are not yet known. Validate address/share copying, app return/paste and the same-attempt desktop fallback within ten minutes before claiming mobile browser support.

The change remains unarchived with both manual tasks unchecked. No authorization URLs, tokens, codes or sensitive network traces are retained in these notes.
