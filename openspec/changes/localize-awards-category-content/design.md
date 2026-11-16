# Design

## Context

Category text reaches the UI from three generated models:

- `AwardsCategory`: the categories list and `result.category`.
- `VotableAwardsCategoryDto`.
- `AwardsBallotCategoryDto`: `AwardsBallotScreen` joins the ballot categories with `useAwardEventCategories`, and uses `category.description || joined?.description`.

Components read `.name` and `.description` directly in about ten places (see proposal Impact). The current language is available through `useTranslation()` → `i18n.resolvedLanguage || i18n.language`, the same pattern as `FeatsPastEventsModal`. `SUPPORTED_LANGUAGES = ["en", "pt-BR"]` is exported by `@repo/locales`. The admin form is `react-hook-form` + zod (`createUpdateAwardsCategorySchema`), and its labels are hard-coded in English.

The server contract is described in game-node-server `add-awards-category-translations`.

## Goals / Non-Goals

**Goals:**
- One resolution rule, implemented once, so every screen behaves the same.
- Re-render on language change without refetching.
- Admin can see and edit both locales.

**Non-Goals:**
- Sending a locale to the API, or changing query keys.
- Localizing other server-provided Awards text.
- Machine translation or copy suggestions in the admin.

## Decisions

### 1. Pure resolver plus a thin hook
Add the following to `packages/ui/src/components/awards/shared/`:

```ts
resolveAwardsCategoryText(
  category: { name: string; description: string; translations?: AwardsCategoryTranslationDto[] | null },
  language: string,
): { name: string; description: string }
```

and

```ts
useAwardsCategoryText(): (category) => { name, description }
```

The hook reads the language from `useTranslation()` and returns a resolver bound to it.

The resolver normalizes the language:
- an exact `pt-BR` match, or any language starting with `pt`, maps to `pt-BR`
- everything else maps to `en`

It picks `translations?.find((t) => t.locale === normalized)` only when that item's `name` and `description` are both non-empty strings, which is a defensive check. Otherwise it returns the base pair.

The pure function makes the rule unit-testable without React. The hook keeps components from repeating the `i18n` lookup.

*Alternative:* resolve once in the query hooks with `select`. We rejected this because query results would depend on the language without it being part of the key, and cached data would go stale when the user switches language.

### 2. Resolve at the display boundary, not by rewriting data
Components call the resolver where they render, or where they build the view model:
- `AwardsBallotScreen` maps `displayCategories` to resolved `name` and `description`, with translations taken from the ballot category, falling back to the joined category's when the ballot's are missing or empty. That one mapping then feeds the list, the panel and the vote-bar interpolation (`activeCategory.name`, `nextCategory.name`).
- `AwardsNominationsScreen` does the same in its view model (lines ~167 and ~376).
- `AwardsSharedBallotScreen` resolves where it renders.
- `AwardsResultsWinnerCard`, `AwardsResultsGOTY` and `AwardsResultsPersonalGOTY` resolve where they render.

`AwardsCategoryList` and `AwardsCategoryPanel` keep accepting plain `name` and `description` props, so they stay dumb. Callers pass resolved text.

### 3. Admin form: flat fields, nested on submit
The zod schema adds `nameEn`, `descriptionEn`, `namePtBR` and `descriptionPtBR`, all optional strings. A `superRefine` makes each locale all-or-nothing and attaches the error to the empty field.

On submit:
- Build the `translations` array from the locales whose fields are filled in, after trimming: `{ locale: "en" | "pt-BR", name, description }`.
- Always send the full array, `[]` when none. The server replaces the whole set on save, so a locale emptied in the form is deleted.

Default values are taken by finding each locale in `category.translations`. The fields are grouped under "English" and "Portuguese (pt-BR)" headings. Flat fields keep the existing `TextInput` + `register` usage. *Alternative:* a `translations` field array in the form state. We rejected it because the `superRefine` paths and the empty-pair handling are simpler with flat fields.

### 4. Coverage column in `AwardsDetailView`
Add a "Translations" column to the category table. It renders `EN` and `PT` Mantine badges: `variant="light"` when present, and `gray` when missing (per AGENTS.md color rules). This is admin-only and has no i18n keys, matching the rest of the admin.

## Risks / Trade-offs

- **[Risk]** The clients deploy before the server, so `translations` is `undefined` at runtime. → The resolver treats `undefined` like `[]`, which falls back to the base text. Older servers are safe.
- **[Risk]** A new category display site gets added later and skips the resolver. → Export the hook from the awards barrel and mention it in a code comment on the models' usage. The spec scenarios cover every current screen in tests.
- **[Trade-off]** The admin labels stay English, unlike the rest of the app's i18n. This is consistent with the current admin.

## Migration Plan

1. Merge and deploy the server change first.
2. Copy its `server_swagger.json` into `packages/wrapper/input/` and regenerate.
3. Ship admin, web and mobile together with one changeset.
4. Admins fill in the translations for the 2026 categories before voting opens.
5. Rollback: revert the clients. The server field is additive and is ignored by older clients.
