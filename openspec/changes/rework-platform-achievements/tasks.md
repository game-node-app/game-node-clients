# Tasks

## 1. Contracts

- [x] 1.1 Server prerequisite (`game-node-server`, separate PR): load `relations: { obtainedAchievement: true }` in the activity reads (`activities-repository.service.ts` `findLatestBy`/`findOneBy` callers used by the feed and `detail/:id`) and regenerate `server_swagger.json`. Verify that a feed response for an `ACHIEVEMENT_UNLOCKED` activity includes `obtainedAchievement.achievementId` and `tier`.
- [x] 1.2 Copy the server `server_swagger.json` to `packages/wrapper/input/` and run `yarn wrapper:generate`. Verify that `AchievementsV2Service`, `AchievementsAdminService`, `AchievementV2Dto`, `NotificationAchievementTargetDto` and `Activity.type.ACHIEVEMENT_UNLOCKED` exist, and that `yarn type-check` passes or reports only the call sites the following tasks change.

## 2. Badge and data hooks (`packages/ui`)

- [x] 2.1 Add `useAchievementsV2(targetUserId)` and `useAchievementProgress(userId)` in `components/achievement/hooks` (design, decision 2). Delete `useObtainedAchievement` and `useNonObtainedAchievements` and update the barrel. Verify with `yarn type-check` that no import of the deleted hooks remains.
- [x] 2.2 Add `ACHIEVEMENT_GLYPHS` (curated kebab-case to Tabler map with an `IconTrophy` fallback), the 10-color tier palette and `AchievementBadge` (glyph, game cover, image, locked and masked states). Rewrite `AchievementLogo` as a wrapper that resolves the definition and tier by `achievementId` and `targetUserId`. Verify with a mobile vitest (`apps/mobile`, the same pattern as `import-discovery-notification.test.tsx`) that renders each icon kind, an unknown glyph and tier 0.

## 3. Achievements page and profiles (web + mobile)

- [x] 3.1 Rewrite `AchievementItem` to take `achievement` and `progress`: badge, progress bar with the next threshold, "complete" state, next-tier XP, secret placeholder, and a tier popover with rarity and obtained marks. Add the `achievements.*` keys to `en.json`/`pt-BR.json` and run `yarn locales:generate-types`. Verify with a vitest covering partial (37 of 50), never evaluated, complete and secret items.
- [x] 3.2 Rewrite `AchievementsScreen` on the two hooks: active and past event sections, obtained and not-yet-obtained sections with working pagination, and the redeem-code button kept for the own profile. Verify on web `/feats/<userId>` and mobile `feats/:userId` that the network tab shows one catalog and one progress request, and that the legacy achievements render with their old icons.
- [x] 3.3 Update the callers of `AchievementItem`/`AchievementLogo`: `ObtainedAchievementItem`, `ProfileFeaturedAchievements`, `MobileProfileFeaturedAchievement`, `ProfileEditFeaturedAchievement`, `AchievementsMultiSelect`, and the admin grant and code views. Featured items show the highest tier. Verify with `yarn type-check` and by opening a web and a mobile profile with a featured achievement.

## 4. Notification and feed

- [x] 4.1 Add the `achievement.unlocked` branch to `AggregatedNotification` (trophy icon, preview name, tier, no actor) and the `target.type === "achievement"` navigation to `/feats/<own userId>`, plus the `notifications.achievementUnlocked` locale key. Verify with a mobile vitest next to `import-discovery-notification.test.tsx` that checks the rendered text and the pushed route.
- [x] 4.2 Add the `ACHIEVEMENT_UNLOCKED` case to `ActivityItem` (text "unlocked <name> tier N" with the badge), using `activity.obtainedAchievement` from task 1.1. Verify by rendering a fixture activity in a vitest, and in the local feed that likes and comments work on it.

## 5. Admin authoring (`apps/admin`)

- [x] 5.1 Add the "Achievement catalog" nav group (`[ADMIN, EDITOR]`, sublinks Definitions and Events) and the `getRolesForRoute` special case for `/dashboard/achievement/definitions` and `/dashboard/achievement/events`. Verify that an `editor` account sees and opens both, and that a `mod`-only account gets the not-authorized state.
- [x] 5.2 Build the definitions list page (`mantine-react-table`, status filter) and the `definitions/[id]` page with `DefinitionForm` (design, decision 9): metric-driven criteria, window or event exclusivity, tier field array, icon picker with a per-tier badge preview, and `isHidden`. Export the zod tier schema and verify it with a jest test (thresholds 5/5 and 10/3 rejected, 11 tiers rejected, XP 5001 rejected).
- [x] 5.3 Add the publish, archive and delete-draft actions with confirm modals (publish and add-tier warn about silent retroactive grants), read-only rule fields for non-draft definitions, and the simulate panel. Verify locally: simulate a draft (no state change), publish it, add a tier, and confirm that a metric/criteria edit is rejected with the server message shown.
- [x] 5.4 Build the events list and the `events/[id]` form with the same actions, start disabled after publish, and end limited to dates later than the saved one. Verify locally that creating, publishing and extending an event works and that shortening it is blocked.

## 6. Integration

- [ ] 6.1 End to end locally (server task 8.1): an editor creates an event with a 3-tier `reviews_written` definition and publishes both. Another user writes reviews inside the window and sees the tiers advance on `/feats`, the inbox item, and the feed activity with likes and comments. After the event ends, it moves to past events with the obtained tiers kept. Run `yarn lint` and `yarn type-check` from the root.

## Workflow follow-up

- Tick tasks 7.1-7.5 in `game-node-server/openspec/changes/rework-platform-achievements/tasks.md` once this change is applied.
- Archive this change after review (`/opsx:archive`).
