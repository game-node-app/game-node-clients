# Tasks

## 1. Contract

- [x] 1.1 Copy the `server_swagger.json` from game-node-server change `add-awards-category-translations` into `packages/wrapper/input/server_swagger.json` and run `pnpm wrapper:generate`. Verify: `packages/wrapper/src/server/models/AwardsCategoryTranslationDto.ts` exists, and `AwardsCategory`, `VotableAwardsCategoryDto` and `AwardsBallotCategoryDto` have `translations: AwardsCategoryTranslationDto[]`.

## 2. Shared resolver

- [x] 2.1 Add `resolveAwardsCategoryText` and `useAwardsCategoryText` under `packages/ui/src/components/awards/shared/` (see design decision 1), then run `pnpm --filter @repo/ui barrels:generate`. Verify: `pnpm type-check -F @repo/ui` passes.
- [x] 2.2 Add `apps/mobile/src/components/awards/awards-category-text.test.ts`. It covers: en entry used, pt-BR entry used, `pt` language → pt-BR, missing locale → base, `[]` or `undefined` translations → base, and an entry with an empty field → base. Verify: `pnpm --filter mobile vitest run src/components/awards/awards-category-text.test.ts` passes.

## 3. Screens

- [x] 3.1 `AwardsBallotScreen`: resolve `name` and `description` in `displayCategories`, using the ballot category's translations, or the joined category's when those are missing or empty, so that the list, the panel and the vote-bar copy use localized names. Verify: a new test in `awards-ballot-screen.test.tsx` shows the `en` name in the list, the panel and "Your vote in …" when the language is `en`, and the base name when there is no `en` entry.
- [x] 3.2 `AwardsNominationsScreen` and `AwardsSharedBallotScreen`: resolve category text where it is displayed. Verify: one localized-name assertion each in `awards-nominations-screen.test.tsx` and `awards-shared-ballot-screen.test.tsx`.
- [x] 3.3 Results (`AwardsResultsWinnerCard`, `AwardsResultsGOTY`, `AwardsResultsPersonalGOTY`): resolve `result.category` text. Verify: an assertion in `awards-results-screen.test.tsx` that a winner card shows the `en` category name.
- [x] 3.4 Search `packages/ui/src` for remaining raw reads of category `.name` and `.description` in awards and recap views. Verify: every remaining hit is either resolved or documented as non-display (keys, logs).

## 4. Admin

- [x] 4.1 Extend `createUpdateAwardsCategorySchema` with the flat per-locale fields and the all-or-nothing `superRefine`, plus a `toTranslationsPayload(values)` helper that returns the array of filled locales (`[]` when none). Verify: `apps/admin/src/components/awards/form/schemas.test.ts` covers both locales filled in, one locale filled in, a partial pair rejected on the empty field, and all empty → `[]`; `pnpm --filter admin test` passes.
- [x] 4.2 `CreateUpdateAwardsCategoryForm`: add "English" and "Portuguese (pt-BR)" name and description inputs, prefill them from `category.translations`, and always send the full `translations` array in the create/update request. Verify: `pnpm type-check -F admin` passes. In the local admin, creating and then editing a category round-trips both locales, and emptying one locale removes it.
- [x] 4.3 `AwardsDetailView`: add the translations coverage column with EN/PT badges. Verify: the local admin shows a gray badge for a missing locale.

## 5. Release and checks

- [x] 5.1 Add a changeset naming `web`, `mobile` and `admin` (minor or patch, following `docs/releases.md`). Verify: `.changeset/*.md` exists and `pnpm test:releases` passes.
- [x] 5.2 Run `pnpm lint`, `pnpm type-check`, `pnpm --filter mobile test` and `pnpm --filter admin test`. Verify: all pass.
- [x] 5.3 Do a browser check against the local server with translated categories. The ballot, nominations and results show English category text at `/awards/...` and Portuguese at `/pt-BR/awards/...`, and an untranslated category shows its base text in both. Verify: notes or screenshots recorded in the PR.
