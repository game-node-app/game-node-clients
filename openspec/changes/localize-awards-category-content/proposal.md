# Proposal

## Why

The Awards screens show interface text in the user's language, but category names and descriptions always show the single text the admin entered, which is mostly Portuguese. An English-speaking user therefore sees a page that is half English and half Portuguese. The server change `add-awards-category-translations` (game-node-server) adds a normalized per-locale translation table and returns each category's `translations` as an array of `{ locale, name, description }`. The clients need to display it and let admins edit it.

## What Changes

- Regenerate `@repo/wrapper` from the updated `server_swagger.json`. Category models (`AwardsCategory`, `VotableAwardsCategoryDto`, `AwardsBallotCategoryDto`) gain a typed `translations: AwardsCategoryTranslationDto[]` field.
- Add one shared resolver in `@repo/ui` that returns a category's `name` and `description` for the current UI language (`en` or `pt-BR`). It falls back to the base text when that locale has no entry.
- Use the resolver everywhere a category name or description is shown:
  - the ballot (header, category list, vote bar "Your vote in {category}" / "Confirm and go to {next}")
  - nominations
  - the shared ballot
  - results (winner card, GOTY, personal GOTY)
  - the shared category list and panel
- The admin category form gets English and Portuguese name and description fields:
  - Each locale is optional as a pair: either both fields are filled in, or both are empty.
  - Filled pairs are sent as the `translations` array; empty pairs are left out of it.
  - Saving always sends the full set, so emptying a locale deletes it on the server.
  - Editing loads the existing translations.
- The admin category table shows which locales are filled in for each category.
- Changeset for `web`, `mobile` and `admin`.

## Capabilities

### New Capabilities
- `awards-category-localization`: how the clients show Awards category content in the user's language and how admins write it.

### Modified Capabilities
<!-- None in openspec/specs. The awards client capabilities (awards-ballot, awards-nominations, awards-results, awards-event-admin) live in the unarchived change integrate-2026-recap-and-awards. This change adds behaviour next to them without changing their requirements. -->

## Impact

- **Depends on** the game-node-server change `add-awards-category-translations` being deployed (or running locally), and on its `server_swagger.json`.
- **Generated code:** `packages/wrapper/input/server_swagger.json`, then `pnpm wrapper:generate`.
- **`packages/ui/src/components/awards`:**
  - a new helper/hook under `shared/`
  - `ballot/AwardsBallotScreen.tsx` and `ballot/AwardsSharedBallotScreen.tsx`
  - `nominations/AwardsNominationsScreen.tsx`
  - `results/AwardsResultsWinnerCard.tsx`, `AwardsResultsGOTY.tsx` and `AwardsResultsPersonalGOTY.tsx`
  - `shared/AwardsCategoryList.tsx`
- **Admin:**
  - `apps/admin/src/components/awards/form/{schemas.ts,CreateUpdateAwardsCategoryForm.tsx}`
  - `AwardsDetailView.tsx`
- **Tests:** mobile vitest (resolver, ballot), and admin jest (schema).
- **No new translation keys.** The admin is English-only, and the user-facing awards copy is unchanged.
