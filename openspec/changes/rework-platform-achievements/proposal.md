# Proposal

## Why

`game-node-server` change `rework-platform-achievements` moved platform achievements to editable definitions with tiers, progress, events, icon descriptors, rarity, secret definitions, `achievement.unlocked` notifications and `ACHIEVEMENT_UNLOCKED` feed activities (server tasks 1-6 are done). The clients still use the v1 catalog, show one static PNG per achievement, issue one obtained-achievement request per item, and have no way for an editor to create achievements. This change is section 7 of that server change: make the clients consume the new contracts.

## What Changes

- Regenerate `@repo/wrapper/server` from the server's new `server_swagger.json` (v2 achievements, admin achievements, `achievement` notification target, `ACHIEVEMENT_UNLOCKED` activity).
- New shared `AchievementBadge` in `@repo/ui`: tier frame and color, plus a glyph, game cover or legacy server icon from the definition's icon descriptor, and a masked state for secret definitions. It replaces the static `AchievementLogo` image.
- Rebuild the shared `AchievementsScreen` (web `feats/[targetUserId]`, mobile `feats`) on `GET /v2/achievements` and one `GET /v2/achievements/progress/:userId` request. It shows a progress bar with the next threshold, tiers with rarity, secret placeholders and active/past event sections. The per-item `useObtainedAchievement` requests go away.
- Featured achievements on profiles (web and mobile) show the badge at the highest obtained tier.
- Render `achievement.unlocked` inbox items: name, tier and badge, and a click that opens the user's achievements page. Render `ACHIEVEMENT_UNLOCKED` feed activities.
- Admin (`apps/admin`): definition list and editor (form driven by the metric catalog, tiers, icon, own window or event, simulate, publish, archive, delete draft) and event list and editor (publish, archive, delete draft), reachable by `admin` and `editor`. The existing grant and code views stay, limited to `admin`/`mod`.
- New `en`/`pt-BR` locale strings for the user-facing text.
- Out of scope: icon image upload, admin role management, any change to the external game-achievement screens (`components/game/achievement`, journal achievements), and redesigning the redeem-code flow.

## Capabilities

### New Capabilities

- `platform-achievements`: how web and mobile present platform achievements, including the catalog, progress, tiers, rarity, secret definitions, events, badges, featured achievements and unlock activities.
- `achievement-authoring`: the admin screens editors use to manage achievement definitions and events.

### Modified Capabilities

- `notification-inbox`: adds rendering and navigation for `achievement.unlocked` items. The capability is defined by the unarchived `rebuild-notification-system` change, so this delta only adds a requirement.

## Impact

- `packages/wrapper`: `input/server_swagger.json` and the generated `src/server`.
- `packages/ui`: `components/achievement/*` (screen, item, logo/badge, hooks, multi-select), `components/profile/{view,edit}` featured achievements, `components/notifications/AggregatedNotification.tsx`, `components/activity/item/ActivityItem.tsx`, `@repo/locales` strings.
- `apps/web`: `pages/feats/[targetUserId].tsx` (uses the shared screen; no direct change expected).
- `apps/mobile`: `pages/feats.tsx`, `components/profile/view/MobileProfileFeaturedAchievement.tsx`.
- `apps/admin`: new `pages/dashboard/achievement/{definitions,events}`, `components/achievement/*`, `Navbar.config.ts`.
- **Server dependency:** feed activity responses expose only `obtainedAchievementId`, and no endpoint resolves it. The server must return the `obtainedAchievement` relation (`achievementId`, `tier`) on activities before the feed item can render (see design).
- No new dependencies.
