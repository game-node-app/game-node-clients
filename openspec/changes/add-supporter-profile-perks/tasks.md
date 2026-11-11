# Tasks

Read `design.md` (decisions D1–D15, including the Figma frame table at the top) and open `mockups.html` in a browser before starting. Tests live in `apps/mobile/src/components/{supporter,profile,collection}/` (Vitest, `// @vitest-environment jsdom` per file), importing from `packages/ui` by relative path, mocking generated services with `vi.spyOn` and wrapping in a `QueryClientProvider` with `retry: false`.

## 1. Contract

- [x] 1.1 Copy `/home/cassi/projects/game-node-server/server_swagger.json` to `packages/wrapper/input/server_swagger.json`, run `yarn wrapper:generate`, and verify with `git diff --stat packages/wrapper` that only additive files/fields changed (6 new models, `ProfileResponseDto` gains `isSupporter`/`supporterPreferences`, new methods on `ProfileService` and a new `SupportersService`); record the exact generated method names if they differ from D1 and use them throughout.
- [x] 1.2 Run `yarn type-check` and verify it passes before any UI change (the new required fields must not break existing `ProfileResponseDto` fixtures; fix test fixtures by adding `isSupporter: false, supporterPreferences: null`).

## 2. Perk primitives

- [x] 2.1 Add `supporter/perks/accentColor.ts` (D3) with `normalizeAccentHex`, `getContrastRatio`, `getReadableAccent`, `hexToRgba`, `getOnAccentText`; verify `accent-color.test.ts` covers the D3 vectors (`#9747FF`→text `#A159FF`, `#101010`→`#888888`/`#646464`, `#FF8800` unchanged, invalid input → null) and `getOnAccentText` returns `#FFFFFF` for `#9747FF` and `#141414` for `#F5C542`.
- [x] 2.2 Add `supporter/perks/supporterTitles.ts` (D13) and `supporterPerks.ts` (D2: defaults, `ActiveSupporterPerks`, `getActiveSupporterPerks`) plus `hooks/useSupporterPerks.ts`; verify `supporter-perks.test.ts` asserts: null prefs → null, missing fields → null, default prefs → badge/border/theme on with `#9747FF`, unknown `titleKey` → `titleKey: null`, every catalog key matches `^[a-z0-9_-]{1,32}$`.
- [x] 2.3 Add `SupporterBadge` (full + compact), `SupporterTitle` and `SupporterAvatarFrame` + CSS module (D4, D5); verify `supporter-perk-components.test.tsx`: compact badge has `aria-label` "Supporter", title renders the translation and nothing for null, frame gets the static class when `useReducedMotion` returns true (mock `@mantine/hooks`).
- [x] 2.4 Add locale keys for D13 titles, `supporter.badge.label`, `supporter.presence.playingNow` in `en.json` and `pt-BR.json`, run `yarn locales:generate-types`, and verify `yarn type-check` passes.

## 3. Profile header and lists

- [x] 3.1 Update `ProfileUserInfoWithBanner` per D4 (CSS variables, 21px theme strip with the right-aligned italic "Supporter" label and tinted column, frame around `UserAvatar`, name block with badge/title) and verify against mockups §1–§3 on web (`yarn dev -F web`, a profile with and without prefs) and in `profile-header-perks.test.tsx` (non-supporter renders no badge/strip; badge off keeps border; theme on renders the strip label and keeps the username white; theme off renders no strip).
- [x] 3.2 Add `hooks/useProfilePresence.ts` and `getProfilePresenceQueryKey` (D6) and `SupporterPresenceChip`; render the chip in the name block only when `perks.liveProfile`; verify `use-profile-presence.test.tsx` with fake timers: no request when the preference is off or `useIsViewActive` returns false, one request on mount, none again before 60 s, one after; and chip tests for linked (`gameId`) vs plain text vs `playing: null` (renders nothing).
- [x] 3.3 Add the compact badge to `UserAvatarGroup` (D10); verify a test that a supporter with `showBadge: true` shows the crown, `showBadge: false` or null prefs shows none, and that `useProfilePresence` is never called from it.

## 4. Preferences editing

- [x] 4.1 Add `hooks/useUpdateSupporterPreferences.ts` (D8); verify `use-update-supporter-preferences.test.tsx`: optimistic merge into `["userProfile", userId]`; server result replaces prefs; 400 rolls back only the patch's keys while a concurrent successful patch to another key survives; 403 shows the not-supporter message and invalidates profile and `["billing","me"]`; wall key invalidated only for `showOnSupportersWall`; presence query removed only for `showLiveProfile`.
- [x] 4.2 Add `SupporterAccentPicker` (presets, `ColorInput`, Reset) and verify tests: preset click sends that uppercase hex, invalid typed value shows the error and sends nothing, Reset sends `null` and is hidden when the stored value is null.
- [x] 4.3 Add `settings/SupporterPerksSettings` with `mode: "edit" | "locked" | "unavailable"` (D7 "How you appear": perks card in Figma order, Library card, "Saving…/Saved" status from `useMutationState`, web-only "See the wall" link, Steam hint via `useOwnUserConnectionByType`; D9 locked mode); verify `supporter-perks-settings.test.tsx`: in `edit` each switch sends exactly its one field, the title select sends `null` for "No title", "Saved" appears after a successful mutation and not after an error; in `locked` every switch is disabled with a lock, the accent row is absent, the note is shown and no request is sent; in `unavailable` controls are disabled and "Try again" invalidates the profile; the Library card shows "Included" vs "Supporters" by mode and custom covers "Coming soon" in all modes.
- [x] 4.4 Rework `SupporterProfilePreview` to take `perks`, `caption` and `onWall` (D7) using the shared perk components, removing the hard-coded violet and the "not listed" line; verify the existing `profile-video-surfaces.test.tsx` still passes and new tests show the preview following a changed accent before the mutation resolves, the wall line switching between "On"/"Not on the supporters wall", and no wall line when `onWall` is null.
- [x] 4.5 Wire `SupporterSettingsView` (D7): pick the `SupporterPerksSettings` mode, pass `withSupportersWall` through for the "See the wall" link, invalidate the own profile when billing `isSupporter` differs from the profile's; delete `SupporterFeatureCatalog` and `supporter-feature-catalog.test.tsx` (D9). Verify the updated `supporter-settings-view.test.tsx` (supporter with prefs gets `edit`; free user gets `locked` with the example caption; activation flips `locked` to `edit` after the profile refetch) and compare on `yarn dev -F web` with mockups §5–§6 and Figma P-D01/P-D07.
- [x] 4.6 Add the D14 `supporter.perks.*` and `supporter.features.availableLabel` keys in both languages (pt-BR from the Figma copy where D14 gives it), remove keys made unused (D14 list, confirmed with `grep -rn` across `packages/ui` and `apps`), run `yarn locales:generate-types`, and verify `yarn type-check` and `yarn lint` pass.

## 5. Supporters wall

- [x] 5.1 Add `hooks/useInfiniteSupportersWall.ts` and `SUPPORTERS_WALL_QUERY_KEY` (D11); verify `use-infinite-supporters-wall.test.tsx`: offsets advance by `limit`, no next page when `hasNextPage` is false.
- [x] 5.2 Add `SupportersWall` (`page` and `settings` variants, loading/empty/error states, items link to `/profile/:userId`); verify tests for the empty invitation (entry link present), error retry, and "Show more" appending a page.
- [x] 5.3 Render `<SupportersWall variant="page" />` in `apps/web/src/pages/about.tsx` with `id="supporters"`, and `withSupportersWall` on the mobile `preferences_supporter.tsx`; add `supporter.wall.*` keys (both languages) and verify signed out on `yarn dev -F web` `/about` and on mobile `yarn dev -F mobile` Preferences › Supporter, against mockup §7.

## 6. Collection limit

- [x] 6.1 Add `useSupporterSettingsHref` and the optional `supporterSettingsHref` registry entry (mobile: `"/preferences/supporter"`); switch `ProfileVideoSupporterNotice` to it; verify a test that the hook returns the registry value when set and `/home?settings=premium` otherwise.
- [x] 6.2 Add `getCollectionLimitError` and `CollectionLimitNotice` and wire them into `CollectionCreateOrUpdateForm` (D12); add `collection.limit.*` keys in both languages; verify `collection-limit.test.tsx`: a 403 with the code shows the notice with "5" and no notification; a 403 without the code and a 500 keep the generic message and notification; a missing `limit` uses the no-count title; editing never shows the notice; clicking the link calls `onClose`.

## 7. Copy and landing

- [x] 7.1 Apply the D14 copy table in `en.json` and `pt-BR.json` and update `apps/web/src/components/landing/SupporterSection.tsx` (D14: `AVAILABLE_ITEMS`, new `AVAILABLE_GROUPS` rendered without the clock/gray badge, `UPCOMING_GROUPS` only `library/customCovers`); verify `grep -ri "stays free\|everything you use today\|continua grátis\|nothing that's free\|nada do que é grátis" packages/locales/src/translations/json` returns only the intended new strings, and the landing pricing card shows "Up to 5 collections" under Free and the shipped perks as available on `yarn dev -F web`.
- [x] 7.2 Add a changeset with `yarn changeset` naming `web` and `mobile` (minor) describing supporter perks, the supporters wall and the collection limit notice; verify the file exists under `.changeset/`.

## 8. Integration

- [x] 8.1 Run `yarn workspace @repo/ui barrels:generate`, `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn build -F web -F mobile`; verify all pass.
- [ ] 8.2 Against a local server running the game-node-server `add-supporter-profile-perks` branch (see `docs/local-browser-testing.md`), walk through: a supporter changes every preference and sees the profile, list badge and preview update; live profile with Steam shows "Playing now" and polls ≤1/min (network tab); opting out removes them from the About wall; a free user with 5 collections gets the limit notice; and run `openspec validate add-supporter-profile-perks --strict`.

## Workflow follow-up

- Deploy no later than the server's `add-supporter-profile-perks` deploy.
- Archive `add-supporter-subscriptions`, then `redesign-supporter-settings`, then this change (its `supporter-subscriptions` delta modifies requirements those two introduce).
