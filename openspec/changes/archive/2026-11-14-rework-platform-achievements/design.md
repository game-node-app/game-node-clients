# Design

## Context

What exists today, as observed in the code:
- `packages/ui/src/components/achievement`: `AchievementsScreen` (shared by web `feats/[targetUserId]` and mobile `feats`) runs `useAllObtainedAchievements` and `useNonObtainedAchievements` (catalog plus obtained list, both v1). It renders `AchievementItem`, which makes one `useObtainedAchievement` request per item, and `AchievementLogo`, which renders `getServerStoredIcon(achievementId)`. Pagination on the not-yet-obtained list is broken (`slice(offset, LIMIT + 1)`).
- `AchievementLogo`/`AchievementItem` are also used by `ProfileFeaturedAchievements`, `MobileProfileFeaturedAchievement`, `ProfileEditFeaturedAchievement`, `AchievementsMultiSelect`, and the admin grant and code views.
- Notifications: the shared `AggregatedNotification` switches on `type` and `target.type`. Activities: the shared `ActivityItem` matches on `activity.type` with `ts-pattern`.
- Admin: `navLinks` in `Navbar.config.ts` drives both the menu and `getRolesForRoute`. That function matches only top-level `link` values by prefix and defaults to `[ADMIN]`, with one special case for the blog preview. Lists use `mantine-react-table` (`AwardsView`) and forms use `react-hook-form` and `zod` (`CreateUpdateAwardsForm`).
- Server contracts, from the regenerated server swagger:
  - `GET /v2/achievements?offset&limit&targetUserId` returns `AchievementV2Dto` with `tiers[].rarity`, `icon`, `event`, and a window. Hidden items not obtained by the target user have nulls.
  - `GET /v2/achievements/progress/:userId` returns `AchievementProgressDto[]` (`value`, `tier`, `nextThreshold`).
  - `GET /v2/achievements/events` returns `active`/`upcoming`/`past`.
  - The admin definition and event CRUD, publish, archive, simulate and metrics endpoints live under `/v1/achievements/admin`.
  - The notification target is `{ type: "achievement", id, tier }`, and the preview text is the definition name.
  - `Activity.type` includes `ACHIEVEMENT_UNLOCKED`, with `obtainedAchievementId`.
  - v1 `ObtainedAchievementDto` has no `tier` field.

## Goals / Non-Goals

**Goals:** consume the v2 and admin contracts with the fewest new components, using two requests for the achievements page, and give editors a usable definition and event editor.

**Non-Goals:** icon upload, a picker covering all Tabler icons, i18n in the admin app (it is English-only today), changes to external game achievements and the journal, and a redeem-code redesign.

## Decisions

1. **Wrapper:** copy `game-node-server/server_swagger.json` to `packages/wrapper/input/server_swagger.json` and run `yarn wrapper:generate`. Generated code is not hand-edited. The v1 `AchievementsService` methods stay, because the grant, code and featured flows still use them.

2. **One data hook pair, no per-item queries.** Add `useAchievementsV2(targetUserId)` (catalog, `limit: 1000`, `targetUserId` passed so obtained secrets are revealed) and `useAchievementProgress(userId)`. Both use React Query with the existing `ExtendedUseQueryResult` shape. The screen joins them in a `useMemo` keyed by `achievementId`. `useObtainedAchievement` and `useNonObtainedAchievements` are deleted. `useAchievements` (v1) stays for the admin grant and code selects.
   `shortcut: catalog fetched in one 1000-item page, paginate server-side if published definitions exceed ~500.`

3. **`AchievementBadge` replaces the inside of `AchievementLogo`.** Props: `icon: AchievementIconDto | null`, `tier: number` (0 = locked), `size`.
   - Frame: a Mantine `ThemeIcon`/`Box` with a border color taken from a 10-entry tier palette constant. Tier 0 is greyed out with reduced opacity.
   - `glyph`: a curated `ACHIEVEMENT_GLYPHS: Record<string, TablerIcon>` map (about 30 kebab-case names, for example `trophy`, `ghost`, `skull`, `star`, `book`, `controller`), with `IconTrophy` as the fallback. A curated map keeps the bundle small; importing every Tabler icon dynamically would not. The admin icon picker reads the same map, so editors can only choose glyphs the clients render. This resolves the server's open question: the glyph set is Tabler, curated.
   - `game_cover`: `useGame(gameId, { relations: { cover: true } })` and the existing cover image helper, as `ActivityItem` does.
   - `image`: `getServerStoredIcon(name)`.
   - `null` icon (hidden): `IconLock` glyph.
   `AchievementLogo` keeps its export and becomes a thin wrapper, `({ achievementId })`, that looks up the definition in `useAchievementsV2` and the tier in progress. That leaves the profile, admin and multi-select callers unchanged in signature. It needs a `targetUserId` for the tier, so the profile featured callers pass it (they already have `userId`).

4. **`AchievementItem` takes data, not ids.** New props: `achievement: AchievementV2Dto`, `progress?: AchievementProgressDto`. It renders the badge, name and description (or the secret placeholder), a Mantine `Progress` with `value/nextThreshold`, "Complete" when `nextThreshold` is null, and the next tier's XP. A `Popover` (shared, works on mobile) lists the tiers with threshold, XP, `(rarity*100).toFixed(1)%` and an obtained check (`level <= progress.tier`). Callers that only have an id (`ObtainedAchievementItem`, `MobileProfileFeaturedAchievement`) resolve it through `useAchievementsV2` and `useAchievementProgress`. React Query dedupes those requests, so N featured items still cost two requests.

5. **Screen layout.** In `AchievementsScreen`, items whose `achievement.event` is non-null are grouped by `event.id`. An event is active when `startsAt <= now < endsAt` and past when `endsAt <= now`. Achievements of upcoming events are not shown (the server already hides them until the event is published; date filtering hides published-but-future ones). Items without an event are split into obtained (`progress.tier > 0`) and not obtained, each in a `DetailsBox`. Each section uses client-side `Pagination`, which also fixes the current slice bug. `GET /v2/achievements/events` is not needed, because the catalog already carries the event of each item and an event with no achievements has nothing to show.

6. **Notifications:** in `AggregatedNotification`, add a branch for `type === "achievement.unlocked"` beside `moderation.applied`/`import.discovery-completed`. It shows `IconTrophy`, the preview text and `t("notifications.achievementUnlocked", { name, tier })`. Click navigation adds `target.type === "achievement"` → `/feats/<own userId>`; the route exists on web and mobile. Notifications carry no icon descriptor, so no badge is shown and the spec's no-hydration rule holds.

7. **Activity:** add `.with(Activity.type.ACHIEVEMENT_UNLOCKED, ...)` to `ActivityItem`. The text is "unlocked <name> tier N", with the badge in the place of the game cover. Likes and comments already work generically on `ActivityItem`.
   **Blocker:** the activity exposes only `obtainedAchievementId` (a numeric row id), and no endpoint resolves it to `achievementId` and `tier`. Server feed reads (`activities-repository.service.ts` `findLatestBy`, the feed and the detail endpoint) must load `relations: { obtainedAchievement: true }`. Task 1.1 covers this as a small server PR in `game-node-server`, after which the wrapper is regenerated. Until then the item falls back to `activity.items.unknown`, which is today's behavior for unknown types.

8. **Admin routing and roles.** Add a top-level nav group "Achievement catalog" with `link: "/dashboard/achievement/definitions"`, roles `[ADMIN, EDITOR]` and sublinks Definitions and Events. `getRolesForRoute` gets one more special case, like the blog preview: paths under `/dashboard/achievement/definitions` or `/dashboard/achievement/events` return `[ADMIN, EDITOR]`. The existing "Achievements" group (grant and code) stays `[ADMIN, MOD]`, because the server grant endpoint is MOD/ADMIN only.

9. **Admin screens.**
   - Pages: `definitions/index.tsx` (a `mantine-react-table` list with a status filter), `definitions/[id].tsx` (`id === "new"` creates), and the same pair for `events`.
   - `DefinitionForm` uses `react-hook-form` and `zod`:
     - Metric select from `GET admin/metrics`, with its description shown.
     - Criteria fields rendered only for the keys in `metric.filters`. `gameIds` uses `useSearchGames` (as `AwardsVoteSubmitForm` does). `themeIds`/`genreIds` use `useGamesResource("themes"|"genres")` in a `MultiSelect`. `year` is a `NumberInput`.
     - Window `DateTimePicker`s, disabled when `!supportsWindow` or when an event is chosen.
     - An event select.
     - A `useFieldArray` of tiers, with the zod refine for 1..10 tiers, increasing thresholds and XP 0..5000.
     - An icon picker: a segmented kind, then the glyph grid from `ACHIEVEMENT_GLYPHS`, game search, or a text name.
     - `isHidden`, and a badge preview per tier.
   - When `status !== "draft"`, the rule fields are `disabled` and only appended tiers are editable. The PATCH sends the full tier list, and the server enforces immutability; server errors are shown with `getErrorMessage` in `notifications.show`.
   - Actions use Mantine `modals.openConfirmModal`. The publish and add-tier confirmation says users who already qualify are granted silently.
   - Simulate is a user `Select` (the `useUserProfiles` used in the grant view) plus a result panel.
   - The event form has the same structure, with start disabled and `minDate = saved endsAt` for end after publish.

10. **Locales:** add `achievements.*` and `notifications.achievementUnlocked` keys to `en.json` and `pt-BR.json`, then run `yarn locales:generate-types`. The current hard-coded English strings in `AchievementsScreen` ("Redeem a code", "Not yet obtained") move to keys while those lines are being rewritten anyway.

## Risks / Trade-offs

- [Activity relation missing on the server] → feed items for unlocks show the generic fallback until the server PR lands. Everything else can ship independently.
- [Curated glyph map] → editors cannot use arbitrary Tabler icons, and adding one is a one-line client PR. This is intentional: an unknown name would not render on clients that are already deployed.
- [Old mobile builds on v1] → the server keeps v1 compatible, so nothing breaks; old builds just see no tiers.
- [Catalog in one page] → see the shortcut in decision 2.
- [`AchievementLogo` now needs catalog data] → admin views that use it make one extra cached request, which is acceptable.

## Open Questions

- The exact glyph list (about 30 names) is for the designer to confirm. Changing it is a code-only edit to `ACHIEVEMENT_GLYPHS`.
