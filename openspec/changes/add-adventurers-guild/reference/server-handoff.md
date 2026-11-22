# Client hand-off: Adventurers Guild (`add-adventurers-guild`)

Server-side implementation of `add-adventurers-guild` is complete. **Client implementation (web and mobile) is a separate change in `game-node-clients`** and is not part of this server change.

This document is the contract for that client work. Every endpoint, field, enum and HTTP status below was checked against the implemented DTOs (`src/guild/dto/*.ts`, `src/profile/dto/profile-response.dto.ts`, `src/notifications/dto/notifications-response.dto.ts`) and the regenerated `server_swagger.json` (all routes and statuses listed here are present there; query DTOs appear as query parameters). Regenerate the client API wrapper from `server_swagger.json` before starting.

All routes are under `/v1` and use the normal Better Auth session (cookie or `Authorization: Bearer <token>`). Protected routes return `401` without a session.

Figma reference: `rvZfYT3eR8ktZAW6g3HO8C`, page `0:1`, components `2:62`.

## 1. Conventions

- **Dates.** `weekStart` is a São Paulo calendar date (`YYYY-MM-DD`, Monday). `nextRefreshAt`, `acceptedAt`, `readyAt`, `claimedAt`, `expiresAt`, `startsAt`, `endsAt`, `publishedAt`, `unlockedAt`, `createdAt`, `updatedAt` and `lastBoardSeenAt` are ISO-8601 UTC instants. Do not apply the viewer's timezone to `weekStart`.
- **Enums.**
  - `rank`: `E`, `D`, `C`, `B`, `A`, `S` (hardest is `S`).
  - `category`: `library`, `event`, `weekly`, `gamenode`.
  - contract `status`: `active`, `ready_to_claim`, `completed`, `abandoned`, `expired`.
  - `objectiveType`: `finish_game`, `write_review`.
  - event `status`: `draft`, `published`, `archived`.
  - reward `kind`: `badge`, `title`, `avatar_frame`, `weekly_chest`.
  - `lina.trigger`: `contract_accepted`, `contract_claimed`, `contract_ready_to_claim`, `returning_after_inactivity`, `weekly_board_refreshed`, `stale_backlog_game`, `default`. `GET /v1/guild` emits only the five reception triggers; accept and claim responses emit their own trigger (section 6).
  - `lina.pose`: `happy`, `neutral`.
  - translation `locale`: `en`, `pt-BR`.
  - `GET /v1/guild/access` `mode`: `supporters`, `public`.
- **Nullable vs optional.** Fields documented as nullable are returned as `null`. Optional fields may be absent (`candidateGames[].name/slug/coverUrl/sinceYear/estimatedHours`, `lina.context.targetGameName`).
- **Mutations return fresh state.** After accept/claim/abandon/cosmetic changes, re-read the entity from the mutation response; do not patch cached copies.
- **Base timestamps.** `GuildContractDto` and `GuildAdminEventResponseDto` include `createdAt`/`updatedAt`. `GuildAdminRewardResponseDto` includes them too.

### Success status codes

| Method | Endpoints | Success |
| --- | --- | --- |
| `GET` (all reads) | all guild reads | `200` |
| `PATCH` | `/v1/guild/cosmetics`, `/v1/guild/admin/events/{id}`, `/v1/guild/admin/rewards/{id}` | `200` |
| `POST` | `/v1/guild/board/seen`, `/v1/guild/contracts/{id}/claim`, `/v1/guild/contracts/{id}/abandon` | `200` (explicitly overridden) |
| `POST` | `/v1/guild/contracts`, `/v1/guild/admin/events`, `/v1/guild/admin/events/{id}/publish`, `/v1/guild/admin/events/{id}/archive`, `/v1/guild/admin/rewards` | `201` |

### Error body

Business errors carry a machine-readable `code` next to `message`:

```json
{ "message": "Adventurers Guild is currently in early access for supporters.", "code": "guild_early_access_required" }
```

Validation errors are standard Nest `400` responses (`message` may be a string or an array of strings); generic `404`s and some `409`s have no `code` (details in section 12).

### DTO index

| DTO | Used by |
| --- | --- |
| `GuildAccessResponseDto` | `GET /v1/guild/access` |
| `GuildLicenseDto`, `GuildLicenseStatsDto`, `GuildYearGoalDto`, `LinaReceptionDto` | `GET /v1/guild` |
| `GuildOverviewResponseDto`, `GuildOverviewCountsDto` | `GET /v1/guild` |
| `GuildBoardSeenResponseDto` | `POST /v1/guild/board/seen` |
| `GetGuildBoardQueryDto`, `GuildBoardResponseDto`, `GuildBoardQuestDto`, `GuildBoardCandidateGameDto`, `GuildBoardQuestMetaDto`, `GuildBoardEventTranslationDto` | `GET /v1/guild/board` |
| `AcceptGuildContractDto` | `POST /v1/guild/contracts` (request) |
| `AcceptGuildContractResponseDto` | `POST /v1/guild/contracts` (response) |
| `GetGuildContractsQueryDto`, `GuildContractsListResponseDto` | `GET /v1/guild/contracts` |
| `GuildContractDto`, `GuildContractTargetGameDto`, `GuildContractPlaytimeProgressDto`, `GuildContractEventSummaryDto` | Contract responses |
| `ClaimGuildContractResponseDto`, `GuildChestResultDto` | `POST /v1/guild/contracts/{id}/claim` |
| `GuildRewardDescriptorDto`, `UserGuildRewardDto`, `GuildRewardsResponseDto` | Reward descriptors, `GET /v1/guild/rewards` |
| `UpdateGuildCosmeticsDto`, `GuildCosmeticsResponseDto` | `PATCH /v1/guild/cosmetics` |
| `GuildEventTranslationDto`, `CreateGuildEventDto`, `UpdateGuildEventDto`, `GuildAdminEventResponseDto` | Admin events |
| `CreateGuildRewardDto`, `UpdateGuildRewardDto`, `GuildAdminRewardResponseDto` | Admin rewards |
| `NotificationGuildTargetDto`, `NotificationTextPreviewDto`, `NotificationInboxItemDto` | `GET /v1/notifications` (`guild.contract-ready`) |
| `ProfileResponseDto` (`guildTitleKey`, `guildFrameKey`) | `GET /v1/profile`, `GET /v1/profile/:id` |

## 2. Early-access rollout gate

`GUILD_ACCESS_MODE` is server configuration (`"supporters"` or `"public"`, default `"public"`; an invalid non-empty value aborts startup). It can flip without a client release; never hard-code the current mode.

`GET /v1/guild/access` is `@Public()` and returns `GuildAccessResponseDto`:

```json
{ "mode": "supporters", "hasAccess": false }
```

`hasAccess` is `true` only for an authenticated caller permitted by the current server mode. This is the decision table:

| Caller | `mode: "public"` | `mode: "supporters"` |
| --- | --- | --- |
| Guest (no session) | `hasAccess: false` | `hasAccess: false` |
| Signed-in free user | `hasAccess: true` | `hasAccess: false` |
| Active supporter | `hasAccess: true` | `hasAccess: true` |
| `ADMIN` / `EDITOR` | `hasAccess: true` | `hasAccess: true` |

Client flow:

1. Call `GET /v1/guild/access` before rendering the Guild Hall (and again when the screen regains focus after a long pause).
2. `hasAccess: false` + guest → show the sign-in CTA. `hasAccess: false` + signed-in → show the early-access CTA. Do not call the other player endpoints in either case.
3. `hasAccess: true` → render the Guild Hall.
4. Every player Guild endpoint except `/access` is gated. If any of them returns **403** with `code: "guild_early_access_required"` and message `"Adventurers Guild is currently in early access for supporters."`, switch to the early-access screen and re-read `/v1/guild/access`; do not retry in a loop.
5. A blocked request does not create a `guild_profile`, license number or board. A lapsed supporter keeps their profile, XP, contracts, unlocks and equipped `guildTitleKey`/`guildFrameKey`; only access is denied while the mode is `supporters`.
6. Admin endpoints are **not** behind this gate; they only require `ADMIN`/`EDITOR`, so editorial staff can stage events before launch.

## 3. Figma frame → endpoint map

| Frame | Screen | Endpoints | Fields/components it renders |
| --- | --- | --- | --- |
| `6:2` | Desktop — Guilda dos Aventureiros | `GET /v1/guild`, `GET /v1/guild/board` (and `?quick=true`), `POST /v1/guild/board/seen`, `GET /v1/guild/contracts`, `POST /v1/guild/contracts`, `POST /v1/guild/contracts/:id/claim`, `POST /v1/guild/contracts/:id/abandon`, `GET /v1/guild/rewards`, `PATCH /v1/guild/cosmetics` | License card (`license`), stats (`license.stats`), year goal (`yearGoal`), tab counts (`counts`), quest cards (`quests[]`), Lina (`lina`), accepted/completed lists (`data[]`), cosmetic inventory (`unlockedRewards`, `equippedTitleKey`, `equippedFrameKey`) |
| `8:268` | Mobile — Guilda dos Aventureiros | Same endpoints and payloads as `6:2` | Condensed layout only; no API difference |
| `9:387` | Estado — Pedido aceito | `POST /v1/guild/contracts` (201), `GET /v1/guild/contracts?tab=accepted` | `contract` (stamped contract: `templateKey`, `rank`, `xpReward`, `targetGame`, `expiresAt`, `status: "active"`) and `lina` (acceptance reception context) |
| `10:409` | Lina — Ficha da personagem & animações | `GET /v1/guild`, `POST /v1/guild/contracts`, `POST /v1/guild/contracts/:id/claim`, `POST /v1/guild/board/seen` | `lina { trigger, pose, context, hasUnseenBoard }`; triggers/poses/context per section 6; `hasUnseenBoard` drives the `!` indicator |
| `2:62` | Componentes & sprites (Tags, Rank, Quest Card) | Board/contract responses (`category`, `rank`, `templateKey`, `criteria`, `targetCount`, `candidateGames`, `meta`, `reward`, `isRecommended`, `isQuick`), `GET /v1/guild` (`yearGoal`, `license.rank/xp`), `GET /v1/guild/rewards` | Category tags, rank sprite/label, quest-card metadata and chips, reward descriptor, recommendation star, quick badge |

## 4. `GET /v1/guild` — Guild Hall overview

Returns `GuildOverviewResponseDto`:

```json
{
  "license": {
    "licenseNumber": 47,
    "rank": "C",
    "xp": 1240,
    "currentRankMinXp": 800,
    "nextRank": "B",
    "nextRankXp": 2000,
    "xpToNextRank": 760,
    "memberSince": "2026-01-04T12:00:00.000Z",
    "equippedTitleKey": "title_chronist",
    "equippedFrameKey": "frame_lantern_glow",
    "stats": { "finishedGames": 47, "backlogGames": 23, "reviewsCount": 12 }
  },
  "activeContracts": [],
  "yearGoal": { "year": 2026, "target": 12, "finished": 7 },
  "counts": { "boardCount": 3, "acceptedCount": 2, "completedCount": 12 },
  "weekStart": "2026-11-16",
  "nextRefreshAt": "2026-11-23T03:00:00.000Z",
  "lina": {
    "trigger": "weekly_board_refreshed",
    "pose": "neutral",
    "context": {},
    "hasUnseenBoard": true
  }
}
```

| Field | Type | Notes |
| --- | --- | --- |
| `license.licenseNumber` | number | Sequential member number; display as `Nº 0047` |
| `license.rank` | `E`–`S` | Current rank |
| `license.xp` | number | Cumulative Guild XP |
| `license.currentRankMinXp` | number | Minimum XP of the current rank |
| `license.nextRank` | rank \| null | `null` at `S` |
| `license.nextRankXp` | number \| null | `null` at `S` |
| `license.xpToNextRank` | number | `0` at `S` |
| `license.memberSince` | date | Profile creation date |
| `license.equippedTitleKey` | string \| null | Same as `guildTitleKey` |
| `license.equippedFrameKey` | string \| null | Same as `guildFrameKey` |
| `license.stats.finishedGames` | number | `collection_entry.status = finished` |
| `license.stats.backlogGames` | number | `collection_entry.status = planned` |
| `license.stats.reviewsCount` | number | Reviews authored by the user |
| `activeContracts` | `GuildContractDto[]` | `active` + `ready_to_claim` only; `ready_to_claim` first, then `updatedAt` DESC |
| `yearGoal` | `{ year, target, finished }` \| null | Current calendar year; `null` when no goal target is configured. Not present on the board response |
| `counts.boardCount` | number | Open quests on the current board (same as unfiltered board length) |
| `counts.acceptedCount` | number | `active` + `ready_to_claim` contracts |
| `counts.completedCount` | number | All completed contracts |
| `weekStart` | string | Monday of the current board week, `America/Sao_Paulo` |
| `nextRefreshAt` | date | Next Monday 00:00 `America/Sao_Paulo`, in UTC |
| `lina` | `LinaReceptionDto` | Section 6 |

This read initializes the Guild profile lazily on first use, runs the inline contract evaluator (so `ready_to_claim` can appear without waiting for the queue), and updates `lastVisitedAt` after evaluating inactivity. It does **not** mark the board as seen.

Rank thresholds for client-side progress UI: `E 0`, `D 300`, `C 800`, `B 2,000`, `A 4,000`, `S 7,500`. Use `currentRankMinXp`, `nextRankXp` and `xpToNextRank` from the response instead of hard-coding.

## 5. `GET /v1/guild/board` — weekly personalized board

### Query

| Query | Type | Default | Notes |
| --- | --- | --- | --- |
| `quick` | boolean | absent | `true` returns only `isQuick: true` quests, ordered easiest rank first |

`GET /v1/guild/board?quick=true` is Lina's "Tem algum pedido mais rápido?" option. Any value other than `true`/`"true"` is treated as false.

### Response

`GuildBoardResponseDto`:

```json
{
  "weekStart": "2026-11-16",
  "nextRefreshAt": "2026-11-23T03:00:00.000Z",
  "quests": [
    {
      "sourceType": "board_entry",
      "boardEntryId": "3f1c2b9e-6a5d-4c8f-9b7a-1e2d3c4b5a69",
      "eventId": null,
      "slug": null,
      "category": "library",
      "templateKey": "forgotten_relic",
      "title": null,
      "description": null,
      "translations": [],
      "rank": "B",
      "xpReward": 250,
      "objectiveType": "finish_game",
      "targetCount": 1,
      "criteria": {},
      "candidateGames": [
        {
          "gameId": 1029,
          "name": "Hollow Knight",
          "slug": "hollow-knight",
          "coverUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg",
          "sinceYear": 2023
        }
      ],
      "meta": { "sinceYear": 2023 },
      "requiresTargetGame": true,
      "reward": {
        "id": "10eb428e-4e91-407a-ae53-04184f12838d",
        "key": "badge_archaeologist",
        "kind": "badge",
        "achievementId": "guild-archaeologist",
        "inChestPool": false,
        "chestBonusXp": 0
      },
      "isRecommended": true,
      "isQuick": false,
      "expiresAt": "2026-11-23T03:00:00.000Z"
    }
  ]
}
```

`GuildBoardQuestDto`:

| Field | Type | Notes |
| --- | --- | --- |
| `sourceType` | `"board_entry"` \| `"event"` | Determines which ID is set |
| `boardEntryId` | string \| null | Set for personalized board entries |
| `eventId` | string \| null | Set for curated events |
| `slug` | string \| null | Event slug only; `null` for board entries |
| `category` | `library` \| `event` \| `weekly` \| `gamenode` | |
| `templateKey` | string \| null | Stable system template key for board entries; `null` for events |
| `title` | string \| null | Event base title only; `null` for board entries |
| `description` | string \| null | Event base description only; `null` for board entries |
| `translations` | `{ locale, title, description }[]` | Event translations; `[]` for board entries and events without translations |
| `rank` | `E`–`S` | |
| `xpReward` | number | |
| `objectiveType` | `finish_game` \| `write_review` | |
| `targetCount` | number | `progressTarget` for the resulting contract |
| `criteria` | object | `gameIds?`, `genreIds?`, `themeIds?`, `keywordIds?`, `maxTimeToBeatHours?`, `finishedInCurrentMonth?` |
| `candidateGames` | `GuildBoardCandidateGameDto[]` | Up to 3; library quests and short-game weekly quest only |
| `meta` | `{ sinceYear?, estimatedHours? }` \| null | Currently only `{ sinceYear }` on `forgotten_relic` when a stale candidate exists; otherwise `null` |
| `requiresTargetGame` | boolean | If true, accept requires `targetGameId` |
| `reward` | descriptor \| null | `{ id, key, kind, achievementId, inChestPool, chestBonusXp }` |
| `isRecommended` | boolean | At most one open quest |
| `isQuick` | boolean | Rank `E`/`D` events are quick; templates carry their own flag |
| `expiresAt` | date | Board refresh or event `endsAt` |

Behavior:

- The server persists three non-event quests per `(user, weekStart)` and merges all active `published` events live on each read. Repeated reads in the same week return the same non-event quests.
- Open board excludes quests already `active`, `ready_to_claim` or `completed` for that board entry/event. `abandoned`/`expired` quests stay visible and re-acceptable while the week/event window is open.
- `isRecommended` priority: first open `forgotten_relic` library quest → first open event → first open weekly quest. It is computed before `quick` filtering, so a quick response can have no recommended quest.
- `candidateGames[].name/slug/coverUrl` may be omitted when the game row cannot be resolved. `sinceYear` appears on stale-backlog chips; `estimatedHours` appears on short-game chips.
- Curated event quests always have `requiresTargetGame: false`; `targetGameId` is still accepted and validated against the event criteria when provided.
- User with an empty library still gets `weekly`, `gamenode` and active event quests.
- Duration enrichment uses a local time-to-beat cache. If the upstream provider is unavailable, reads still succeed with cached data; a quest/chip may then omit `estimatedHours`, and `playtimeProgress.estimatedPercent` may be `null`.

## 6. Lina reception and unseen board

`LinaReceptionDto` is included in `GET /v1/guild` and in accept/claim responses. It is **not** included in board, contracts-list or rewards responses.

`GET /v1/guild` emits only the five reception triggers in the priority order below. `POST /v1/guild/contracts` emits `contract_accepted` and `POST /v1/guild/contracts/{id}/claim` emits `contract_claimed`; those two are never returned by `GET /v1/guild`.

| Field | Type | Notes |
| --- | --- | --- |
| `trigger` | enum | Priority order below |
| `pose` | `happy` \| `neutral` | `happy` for `contract_accepted`, `contract_claimed` and `contract_ready_to_claim` |
| `context` | object | Trigger-specific fields below |
| `hasUnseenBoard` | boolean | Drives the `!` indicator |

| Priority | `trigger` | `pose` | `context` |
| --- | --- | --- | --- |
| 1 | `contract_ready_to_claim` | `happy` | `{ contractId, category, templateKey, eventId, targetGameId, targetGameName? }` |
| 2 | `returning_after_inactivity` | `neutral` | `{ inactiveDays }` |
| 3 | `weekly_board_refreshed` | `neutral` | `{}` |
| 4 | `stale_backlog_game` | `neutral` | `{ gameId, gameName, sinceYear }` |
| 5 | `default` | `neutral` | `{}` |
| — | `contract_accepted` | `happy` | `{ contractId, category, templateKey, eventId, targetGameId, targetGameName? }` |
| — | `contract_claimed` | `happy` | `{ contractId, xpAwarded, rankBefore, rankAfter, rankedUp }` |

- `hasUnseenBoard` is `true` when `lastBoardSeenAt` is null, before the current Monday cycle, or before the latest `publishedAt` of an active curated event.
- `POST /v1/guild/board/seen` returns `{ hasUnseenBoard: false, lastBoardSeenAt }` (200). It never changes `lastVisitedAt`.
- A visit updates `lastVisitedAt` after the inactivity check, so an immediate second request no longer reports `returning_after_inactivity`.
- Accept and claim responses compute `hasUnseenBoard` but never change `lastVisitedAt`; only `GET /v1/guild` does.
- `targetGameName` is present only when the ready or accepted contract has a bound game whose name can be resolved; fall back to the contract's `targetGame`.

## 7. Contracts

### 7.1 `POST /v1/guild/contracts` — accept (frame 9:387)

Body `AcceptGuildContractDto`:

```json
{ "boardEntryId": "3f1c2b9e-6a5d-4c8f-9b7a-1e2d3c4b5a69", "targetGameId": 1029 }
```

- Provide **exactly one** of `boardEntryId` or `eventId`; both or neither is 400 (`"Provide exactly one of boardEntryId or eventId."`).
- `boardEntryId` must be an entry of the authenticated user for the current week. Unknown/foreign → 404 (`"Board quest not found."`); previous week → 400.
- `eventId` must be a `published` event whose `[startsAt, endsAt)` contains now. Unknown/unpublished → 404; outside window → 400.
- `targetGameId` is required when the quest has `requiresTargetGame: true`. If supplied on an optional-target quest, it must exist and satisfy the criteria. Target validation is 400 with a plain message:
  - game not in `game` table;
  - already `finished` in the user's library;
  - `forgotten_relic`: not a planned/dropped entry older than 365 days without recent playtime;
  - `deep_dive`: not in `playing` status;
  - `gameIds`/`genreIds`/`themeIds`/`keywordIds`/`maxTimeToBeatHours` mismatch.
- Cap: 3 non-terminal contracts (`active` + `ready_to_claim`). A 4th accept is 409 `code: "guild_active_contract_limit_reached"`.
- Duplicate: same `boardEntryId`/`eventId` already `active`, `ready_to_claim` or `completed` → 409 `code: "guild_contract_already_exists"`. Concurrent accepts are serialized per user; at most one wins.
- Accepted contract starts `active`, `progressCurrent: 0`, `progressTarget` = quest `targetCount`, `acceptedAt` = now, `expiresAt` = board refresh or event `endsAt`.

Response (201) `AcceptGuildContractResponseDto`: `{ contract: GuildContractDto, lina: LinaReceptionDto }`. `lina` is the acceptance confirmation: `trigger: "contract_accepted"`, `pose: "happy"`, `context: { contractId, category, templateKey, eventId, targetGameId, targetGameName? }` (`targetGameName` present when the bound target game resolves). Accepting does not change `lastVisitedAt`.

### 7.2 Contract shape (`GuildContractDto`)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `boardEntryId` | string \| null | |
| `eventId` | string \| null | |
| `category` | `library` \| `event` \| `weekly` \| `gamenode` | |
| `templateKey` | string \| null | `null` for events |
| `rank` | `E`–`S` | |
| `xpReward` | number | Base reward, before bonuses |
| `objectiveType` | `finish_game` \| `write_review` | |
| `criteria` | object | Same criteria shape as the board |
| `targetGameId` | number \| null | |
| `targetGame` | `{ gameId, name, slug, coverUrl }` \| null | Null without a target |
| `progressCurrent` | number | |
| `progressTarget` | number | |
| `status` | enum | |
| `playtimeProgress` | `{ playedSeconds, estimatedTotalSeconds, estimatedPercent }` \| null | Only for `active` `finish_game` contracts with a target; percent clamped `0..99`, `null` when TTB is unavailable |
| `reward` | descriptor \| null | |
| `event` | `{ id, slug, title, description, translations }` \| null | Event summary |
| `claimPayload` | object \| null | Filled after claim (section 7.4) |
| `acceptedAt` | date | |
| `readyAt` | date \| null | Set when it becomes claimable |
| `claimedAt` | date \| null | Set after claim |
| `expiresAt` | date \| null | |
| `createdAt`, `updatedAt` | date | |

### 7.3 `GET /v1/guild/contracts` — lists

| Query | Type | Default | Notes |
| --- | --- | --- | --- |
| `status` | enum | absent | `active`, `ready_to_claim`, `completed`, `abandoned`, `expired` |
| `tab` | `accepted` \| `completed` | absent | `accepted` = active + ready (`ready_to_claim` first); `completed` = completed only |
| `offset` | integer | `0` | `>= 0` |
| `limit` | integer | `20` | `1..100` |

- If neither `tab` nor `status` is sent, all of the user's contracts are returned, across every status, ordered by `updatedAt` DESC.
- `tab` wins over `status` when both are sent.
- Accepted ordering: `ready_to_claim` first, then `updatedAt` DESC. All other filters: `updatedAt` DESC.
- Response `GuildContractsListResponseDto`: `{ data: GuildContractDto[], pagination: { totalItems, totalPages, hasNextPage } }`. Empty list is 200, not 404.

### 7.4 `POST /v1/guild/contracts/{id}/claim` — Lina's counter (frame 10:409)

Only an owned `ready_to_claim` contract can be claimed. Unknown/not owned → 404. Any other status → 409 `code: "guild_contract_not_ready"`. Concurrent claims succeed at most once; the other gets 409.

Response (200) `ClaimGuildContractResponseDto`:

| Field | Type | Notes |
| --- | --- | --- |
| `contract` | `GuildContractDto` | Now `completed`, `claimedAt` set, `claimPayload` filled |
| `xpAwarded` | number | Contract XP + duplicate/chest bonus; credited to Guild XP and global `UserLevel` XP |
| `rankBefore` | rank | |
| `rankAfter` | rank | |
| `unlockedRewards` | descriptor[] | Only newly granted items; an already-owned title/frame/badge is not repeated |
| `chestResult` | `{ bonusXp, unlockedCosmetic }` \| null | Non-null only for `weekly_chest`; `unlockedCosmetic` null when the pool is exhausted (extra +50 XP included) |
| `lina` | `LinaReceptionDto` | Delivery celebration: `trigger: "contract_claimed"`, `pose: "happy"`, `context: { contractId, xpAwarded, rankBefore, rankAfter, rankedUp }`. Does not change `lastVisitedAt` |

`claimPayload` persisted on the contract is exactly `{ xpAwarded, rankBefore, rankAfter, unlockedRewards, chestResult }`. A contract that became `ready_to_claim` before its deadline remains claimable after the deadline; do not hide it based on `expiresAt`.

### 7.5 `POST /v1/guild/contracts/{id}/abandon`

Only an owned `active` contract can be abandoned. Unknown/not owned → 404. Other status → 409 `code: "guild_contract_not_active"`. Response (200) is the updated `GuildContractDto` with `status: "abandoned"`. The quest reappears on the open board while its week/event window is still valid.

## 8. Rewards and profile cosmetics

### 8.1 `GET /v1/guild/rewards`

`GuildRewardsResponseDto`:

```json
{
  "unlockedRewards": [
    {
      "id": 1,
      "reward": {
        "id": "ae5accd3-8e22-4aff-aa92-290b32e06cb4",
        "key": "title_chronist",
        "kind": "title",
        "achievementId": null,
        "inChestPool": false,
        "chestBonusXp": 0
      },
      "sourceContractId": "6c5b4a39-2817-4f6e-8d9c-0b1a2c3d4e5f",
      "unlockedAt": "2026-11-21T12:00:00.000Z"
    }
  ],
  "equippedTitleKey": "title_chronist",
  "equippedFrameKey": null
}
```

`unlockedRewards` is ordered by `unlockedAt` DESC. `id` is the user-inventory row (number). `sourceContractId` is nullable.

### 8.2 `PATCH /v1/guild/cosmetics`

Body `UpdateGuildCosmeticsDto`:

```json
{ "guildTitleKey": "title_chronist", "guildFrameKey": null }
```

- Both fields are optional and independent: omitted keeps the current value; `null` unequips; non-null strings are 1–64 chars.
- Both requested non-null keys are validated before any write. The key must be owned and of the matching kind (`title` for `guildTitleKey`, `avatar_frame` for `guildFrameKey`); otherwise 403 `code: "guild_cosmetic_not_owned"` and nothing changes.
- Response `GuildCosmeticsResponseDto`: `{ guildTitleKey, guildFrameKey }`.

### 8.3 Profile reads: coexistence with `supporterPreferences`

`ProfileResponseDto` on both `GET /v1/profile` and `GET /v1/profile/:id` now includes:

```json
{
  "guildTitleKey": "title_chronist",
  "guildFrameKey": "frame_lantern_glow"
}
```

Rules:

- Both fields are nullable and always present; they add zero extra SQL statements to profile reads.
- Guild cosmetics are permanent and independent of supporter entitlement. `supporterPreferences` becomes `null` when the user is not a supporter, while `guildTitleKey`/`guildFrameKey` remain intact.
- Equipping/clearing a Guild cosmetic never mutates `supporterPreferences`; do not clear either system because the other changes.
- Rendering: show `guildTitleKey`/`guildFrameKey` in Guild contexts (Guild License, Guild Hall, Guild reward surfaces). Show supporter `titleKey`, badge, animated border and theme from `supporterPreferences` independently. Both may be visible at once in the profile; neither replaces the other in data.

## 9. Notification `guild.contract-ready`

When a contract moves `active` → `ready_to_claim`, an event `guild.contract-ready` (version 1, no actor) is committed atomically and projected as one individual inbox item per contract.

`GET /v1/notifications` item:

```json
{
  "type": "guild.contract-ready",
  "actors": [],
  "preview": {
    "text": "A Guild contract is ready to turn in.",
    "game": {
      "id": 1029,
      "name": "Hollow Knight",
      "slug": "hollow-knight",
      "coverUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg"
    }
  },
  "target": { "type": "guild", "contractId": "6c5b4a39-2817-4f6e-8d9c-0b1a2c3d4e5f" },
  "eventCount": 1,
  "actorCount": 0,
  "lastEventAt": "2026-11-21T12:00:00.000Z",
  "version": 1,
  "readVersion": 0
}
```

- `preview.game` is optional (present only when the contract has a target game with context).
- `target.type` is `"guild"` and `target.contractId` identifies the contract.
- Duplicate evaluation/retries create at most one inbox item per contract.
- Deep-link to the Guild's accepted/ready contracts. There is no single-contract GET endpoint; resolve `contractId` from `GET /v1/guild` (`activeContracts`) or `GET /v1/guild/contracts`. If the contract is no longer `ready_to_claim`, refresh the list instead of erroring.

## 10. Curated events and reward catalog (admin)

All admin routes require an authenticated `ADMIN` or `EDITOR`; unauthenticated calls are 401, other roles 403. They are not affected by `GUILD_ACCESS_MODE`.

### 10.1 Events — `/v1/guild/admin/events`

`GuildAdminEventResponseDto`:

```json
{
  "id": "9d8c7b6a-5f4e-3d2c-1b0a-9f8e7d6c5b4a",
  "slug": "metroidvania-month-2026",
  "title": "Metroidvania Month",
  "description": "Finish a Metroidvania this month.",
  "rank": "A",
  "xpReward": 400,
  "objectiveType": "finish_game",
  "targetCount": 1,
  "criteria": { "genreIds": [8], "keywordIds": [2045] },
  "reward": {
    "id": "091c8a5e-9be5-4fce-85dc-d35edb5d3bb0",
    "key": "frame_parchment_seal",
    "kind": "avatar_frame",
    "achievementId": null,
    "inChestPool": true,
    "chestBonusXp": 0
  },
  "startsAt": "2026-11-01T03:00:00.000Z",
  "endsAt": "2026-12-01T02:59:59.000Z",
  "status": "draft",
  "publishedAt": null,
  "translations": [
    { "locale": "en", "title": "Metroidvania Month", "description": "Finish a Metroidvania this month." },
    { "locale": "pt-BR", "title": "Mês do Metroidvania", "description": "Finalize um Metroidvania neste mês." }
  ],
  "createdAt": "2026-10-20T12:00:00.000Z",
  "updatedAt": "2026-10-20T12:00:00.000Z"
}
```

**Create** (`POST`, 201) body `CreateGuildEventDto`:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `slug` | string | yes | 1–64 chars, unique (409 if taken) |
| `title` | string | yes | 1–120 chars, trimmed non-empty |
| `description` | string | yes | 1–500 chars, trimmed non-empty |
| `rank` | `E`–`S` | yes | |
| `xpReward` | integer | yes | `>= 1` |
| `objectiveType` | `finish_game` \| `write_review` | yes | |
| `targetCount` | integer | no | default 1, `>= 1` |
| `criteria` | object | no | default `{}`; validated per objective |
| `rewardId` | UUID | no | must reference an active reward |
| `startsAt` | date | yes | |
| `endsAt` | date | yes | must be `> startsAt` |
| `translations` | array | no | `{ locale: "en"\|"pt-BR", title, description }`; duplicate locale or empty text → 400 |

Criteria validation (`400` with `{ message: "Invalid quest rules.", errors: string[] }`):

- `finish_game`: `gameIds`, `genreIds`, `themeIds`, `keywordIds` (arrays of positive integers) and `maxTimeToBeatHours` (positive number).
- `write_review`: `gameIds`, `genreIds`, `themeIds`, `keywordIds` and `finishedInCurrentMonth` (boolean).
- Any other key or wrong type is rejected. `maxTimeToBeatHours` on `write_review` is rejected.

**Update** (`PATCH`, 200) accepts any subset of the create fields. Semantics:

- `translations` omitted → preserve; `[]` → clear; non-empty array → replace atomically. Duplicate locale → 400.
- If at least one contract exists for the event, changing `objectiveType`, `criteria`, `targetCount`, `xpReward` or `rewardId` returns 409 `code: "guild_event_rules_locked"`. Changes to any other field remain allowed as long as the resulting window still satisfies `endsAt > startsAt`.
- Duplicate slug → 409 (no code). Unknown event → 404.
- `status` is not writable through create/update; change it only with `publish`/`archive`.

**Lifecycle**:

- `POST /events/:id/publish` (201) sets `status: "published"` and `publishedAt` to now. Requires `endsAt > now` (400 otherwise); a linked `badge` reward requires a `published` `AchievementDefinition` (400 otherwise); an archived event cannot be published (409).
- `POST /events/:id/archive` (201) sets `status: "archived"` and leaves existing contracts claimable. New boards stop showing it.
- Events start as `draft`; player boards only merge `published` events inside their window.

**Lists**: `GET /v1/guild/admin/events` returns all statuses ordered by `createdAt` DESC; `GET /v1/guild/admin/events/:id` returns one event.

### 10.2 Rewards — `/v1/guild/admin/rewards`

`GuildAdminRewardResponseDto`:

```json
{
  "id": "ae5accd3-8e22-4aff-aa92-290b32e06cb4",
  "key": "title_chronist",
  "kind": "title",
  "achievementId": null,
  "inChestPool": false,
  "chestBonusXp": 0,
  "isActive": true,
  "createdAt": "2026-11-01T12:00:00.000Z",
  "updatedAt": "2026-11-01T12:00:00.000Z"
}
```

**Create** (`POST`, 201) body `CreateGuildRewardDto`:

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `key` | string | yes | 1–64 chars, unique (409 if taken) |
| `kind` | `badge` \| `title` \| `avatar_frame` \| `weekly_chest` | yes | |
| `achievementId` | string | required for `badge` | must exist in `achievement_definition` (400 otherwise) |
| `inChestPool` | boolean | no | default false; only valid for `title`/`avatar_frame` (400 otherwise) |
| `chestBonusXp` | integer | no | default 0, `>= 0` |
| `isActive` | boolean | no | default true |

**Update** (`PATCH`, 200) accepts any subset; the same validations run against the merged state. Unknown reward → 404. No delete endpoint: deactivate with `isActive: false`.

**List**: `GET /v1/guild/admin/rewards` ordered by `createdAt` DESC.

## 11. Localization tables

The server does **not** localize system quest copy, Lina prose or rank titles; clients render them from stable keys. The copy below is the agreed baseline for both locales.

### 11.1 `templateKey`

The API also returns `rank`, `xpReward`, `objectiveType`, `targetCount`, `criteria`, `reward` — always use those values for logic and numbers; this table is for rendering and metadata.

| `templateKey` | Category | Rank | XP | Objective | Target | `requiresTargetGame` | `isQuick` | Reward key |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `forgotten_relic` | `library` | `B` | 250 | `finish_game` | 1 | true | false | `badge_archaeologist` |
| `deep_dive` | `library` | `C` | 200 | `finish_game` | 1 | true | false | `weekly_chest` |
| `short_caravan` | `weekly` | `D` | 150 | `finish_game` | 1 | false | true | `weekly_chest` |
| `weekend_sprint` | `weekly` | `D` | 140 | `finish_game` | 1 | false | true | `weekly_chest` |
| `captains_log` | `gamenode` | `E` | 80 | `write_review` | 1 | false | true | `title_chronist` |
| `on_duty_critic` | `gamenode` | `D` | 120 | `write_review` | 3 | false | false | `weekly_chest` |

| `templateKey` | `en` title / description | `pt-BR` title / description |
| --- | --- | --- |
| `forgotten_relic` | Forgotten Relic — Finish a game that has been waiting in your backlog for over a year. | Relíquia Esquecida — Finalize um jogo esquecido no seu backlog há mais de um ano. |
| `deep_dive` | Deep Dive — Finish a game you are currently playing. | Mergulho Profundo — Finalize um jogo que você está jogando. |
| `short_caravan` | Short Caravan — Finish a game that takes 8 hours or less. | Caravana Curta — Finalize um jogo de até 8 horas. |
| `weekend_sprint` | Weekend Sprint — Finish any game from your library this week. | Corrida de Fim de Semana — Finalize qualquer jogo da sua biblioteca nesta semana. |
| `captains_log` | Captain's Log — Write a review for a game you finished this month. | Diário de Bordo — Escreva uma review de um jogo que você finalizou neste mês. |
| `on_duty_critic` | On-Duty Critic — Write 3 reviews this week. | Crítico de Plantão — Escreva 3 reviews esta semana. |

### 11.2 Lina `trigger`

| `trigger` | Pose | `en` copy | `pt-BR` copy |
| --- | --- | --- | --- |
| `contract_accepted` | `happy` | Quest accepted! Your contract is stamped and ready to complete. | Pedido aceito! Seu contrato está carimbado e pronto para concluir. |
| `contract_claimed` | `happy` | Contract delivered! Here is your reward. | Contrato entregue! Aqui está a sua recompensa. |
| `contract_ready_to_claim` | `happy` | Your contract is ready to turn in! | Seu contrato está pronto para entregar! |
| `returning_after_inactivity` | `neutral` | Welcome back! It's been a while. | Bem-vindo de volta! Faz tempo. |
| `weekly_board_refreshed` | `neutral` | A new board is waiting for you. | Um novo quadro espera por você. |
| `stale_backlog_game` | `neutral` | This one has been waiting a long time… | Esse aqui espera há muito tempo… |
| `default` | `neutral` | Welcome to the Adventurers Guild. | Bem-vindo à Guilda dos Aventureiros. |

Context fields by trigger: `contract_accepted` → `contractId`, `category`, `templateKey`, `eventId`, `targetGameId`, optional `targetGameName`; `contract_claimed` → `contractId`, `xpAwarded`, `rankBefore`, `rankAfter`, `rankedUp`; `contract_ready_to_claim` → `contractId`, `category`, `templateKey`, `eventId`, `targetGameId`, optional `targetGameName`; `returning_after_inactivity` → `inactiveDays`; `weekly_board_refreshed`/`default` → `{}`; `stale_backlog_game` → `gameId`, `gameName`, `sinceYear`. Animate poses by `trigger` + `pose`; treat unknown context keys as additive.

### 11.3 Rank titles (`E`–`S`)

| Rank | Suggested key | `en` | `pt-BR` |
| --- | --- | --- | --- |
| `E` | `guild.rank.E` | Novice | Novato |
| `D` | `guild.rank.D` | Apprentice | Aprendiz |
| `C` | `guild.rank.C` | Adventurer | Aventureiro |
| `B` | `guild.rank.B` | Veteran | Veterano |
| `A` | `guild.rank.A` | Elite | Elite |
| `S` | `guild.rank.S` | Legend | Lenda |

### 11.4 Starter cosmetic keys

| Key | Kind | Suggested `en` | Suggested `pt-BR` |
| --- | --- | --- | --- |
| `badge_archaeologist` | `badge` | Archaeologist | Arqueólogo |
| `title_chronist` | `title` | Chronicler | Cronista |
| `weekly_chest` | `weekly_chest` | Weekly Chest | Baú Semanal |
| `title_backlog_slayer` | `title` | Backlog Slayer | Caçador de Backlog |
| `title_guild_veteran` | `title` | Guild Veteran | Veterano da Guilda |
| `frame_parchment_seal` | `avatar_frame` | Parchment Seal | Selo de Pergaminho |
| `frame_lantern_glow` | `avatar_frame` | Lantern Glow | Brilho de Lanterna |

`badge_archaeologist` is linked to the platform achievement `guild-archaeologist`; `weekly_chest` has `chestBonusXp: 75`. Treat unknown keys as forward-compatible and render a generic label.

Rendering rules:

- `guildTitleKey` renders as the Guild title in Guild/License surfaces (and may appear next to the username); `guildFrameKey` wraps the avatar only. Both apply only while non-null; `null` means no Guild cosmetic and the client keeps its existing avatar/supporter styling.
- `badge` rewards are platform achievement badges, not profile keys; show them in the reward/achievement inventory, never in `guildTitleKey`/`guildFrameKey`.
- `weekly_chest` is a claim-time reward, not an equippable cosmetic; render `chestResult` (and `unlockedCosmetic`) in the claim celebration.
- An unknown cosmetic key must degrade to a generic label/placeholder; do not hide the inventory entry.

## 12. Error codes

| HTTP | `code` | Where | Client handling |
| --- | --- | --- | --- |
| 400 | — | invalid body/query, invalid target game, invalid dates/criteria/translations | Show field/message; do not retry unchanged |
| 401 | — | missing/invalid session on a protected route | Send to sign-in |
| 403 | `guild_early_access_required` | player Guild routes under `supporters` for non-supporters | Early-access screen; re-read `/v1/guild/access` |
| 403 | `guild_cosmetic_not_owned` | `PATCH /v1/guild/cosmetics` | Keep previous equipped state; show "not owned" |
| 403 | — | admin route without `ADMIN`/`EDITOR` | Hide admin UI or show forbidden |
| 404 | — | unknown/foreign contract, board entry, event or reward | Refresh the relevant list |
| 409 | `guild_active_contract_limit_reached` | accept | Show the 3-contract limit |
| 409 | `guild_contract_already_exists` | accept | Refresh board/contracts |
| 409 | `guild_contract_not_ready` | claim | Refresh contract; it may already be claimed/abandoned |
| 409 | `guild_contract_not_active` | abandon | Refresh contract |
| 409 | `guild_event_rules_locked` | admin event update | Show locked-rules explanation |
| 409 | — (message only) | duplicate slug/key, publish archived, other admin conflicts | Show `message` |

## 13. Out of scope for this server change

- Web/mobile Guild UI, Lina sprites/animations, quest-card art, cosmetic rendering: **separate change in `game-node-clients`**.
- Server-side localization of system quest copy, Lina dialogue, rank titles, cosmetic display names.
- Real-time/WebSocket contract readiness: delivered through the existing notifications inbox and the next Guild read.
- Multiplayer/clan guilds, leaderboards, user-authored quests beyond the existing yearly goal.
- `DELETE` endpoints for events/rewards (use `archive`/`isActive`), and any `locale` query parameter (translations are always returned as an array).
