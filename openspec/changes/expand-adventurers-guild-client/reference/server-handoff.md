# Client hand-off: Adventurers Guild expansion (`expand-adventurers-guild-quests-and-rewards`)

Server-side implementation of `expand-adventurers-guild-quests-and-rewards` is complete. **Client implementation (web and mobile) is a separate change in `game-node-clients`.**

This document is the contract for that client work and covers only the **delta** on top of `openspec/changes/add-adventurers-guild/handoff-clients.md`; everything documented there still applies unless this document says otherwise. Every route, success status, DTO field and seeded key below was checked against the implemented DTOs (`src/guild/dto/*.ts`), the Guild constants/services and the regenerated `server_swagger.json` (see section 12 for the verification result). Regenerate the client API wrapper from `server_swagger.json` before starting.

All routes are under `/v1` and use the normal Better Auth session (cookie or `Authorization: Bearer <token>`). Protected routes return `401` without a session. The `GUILD_ACCESS_MODE` early-access gate is unchanged: every player Guild route except `GET /v1/guild/access` can still return `403` with `code: "guild_early_access_required"`; admin routes are not gated by it.

## 1. Conventions and compatibility

### 1.1 Dates and keys

- `weekStart` is a São Paulo calendar date (`YYYY-MM-DD`, Monday). `acceptedAt`, `nextRefreshAt`, `nextRotationAt`, `resetsAt`, `expiresAt`, `startsAt`, `endsAt`, `publishedAt`, `reached100At`, `unlockedAt`, `createdAt` and `updatedAt` are ISO-8601 UTC instants.
- `monthKey` is a São Paulo calendar month (`YYYY-MM`) and must be treated as an opaque key. New in this change: Monthly Expeditions, the Passport and the Emporium all use it.
- `periodKey` is internal and not exposed. Board quests carry `cycle: "weekly" | "monthly"` instead.
- `nextRefreshAt` is the next Monday 00:00 São Paulo. `nextRotationAt` and `resetsAt` are the 1st of the next São Paulo month at 00:00 (03:00 UTC), i.e. the current month changes at `2026-12-01T03:00:00.000Z` for `monthKey: "2026-11"`.

### 1.2 Enums (delta)

| Enum | Values | Notes |
| --- | --- | --- |
| `rank` | `E`, `D`, `C`, `B`, `A`, `S` | Unchanged |
| `category` | `library`, `event`, `weekly`, `gamenode`, `monthly` | **`monthly` is new**: Monthly Expedition board quests |
| `cycle` | `weekly`, `monthly` | New per-quest field; `null` for curated events |
| contract `status` | `active`, `ready_to_claim`, `completed`, `abandoned`, `expired` | Unchanged |
| `objectiveType` | `finish_game`, `write_review`, `log_playtime`, `play_distinct_days`, `daily_challenge`, `earn_game_achievements`, `complete_game_100`, `curate_collection`, `publish_post`, `triage_backlog` | **8 new values** |
| event / bounty `status` | `draft`, `published`, `archived` | Bounties use the same values |
| reward `kind` | `badge`, `title`, `avatar_frame`, `weekly_chest` (legacy), `license_theme`, `stamp_style`, `tavern_decor`, `consumable`, `chest_bronze`, `chest_silver`, `chest_gold`, `chest_relic` | **8 new values** |
| reward `rarity` | `common`, `uncommon`, `rare`, `epic`, `legendary` | New |
| `consumableKey` | `hourglass`, `reroll_charter`, `extra_slot_permit` | New |
| `chainKey` | `pathfinders_arc`, `curators_arc`, `relic_hunters_arc` | New |
| chain list `status` | `locked`, `available`, `in_progress`, `completed` | New; persisted chain `status` is only `in_progress` / `completed` |
| passport milestone `status` | `locked`, `claimable`, `claimed` | New |
| `lina.trigger` | previous 7 values + `rank_promoted`, `chain_completed`, `community_bounty_ready`, `monthly_expedition_refreshed` | **4 new values** |
| `lina.pose` | `happy`, `neutral` | Unchanged |
| bounty `milestone` | `25`, `50`, `100`, `150` | Numbers in JSON, not strings |
| translation `locale` | `en`, `pt-BR` | Unchanged |

`GET /v1/guild` emits only the seven reception triggers in section 4.1. Claim responses emit `contract_claimed`, `rank_promoted` or `chain_completed`; they are never returned by `GET /v1/guild`.

### 1.3 Success status codes (delta)

| Method | Endpoints | Success |
| --- | --- | --- |
| `GET` | all new Guild reads (`emporium`, `passport`, `chains`, `bounties`, admin lists/gets) | `200` |
| `POST` | `board/{entryId}/reroll`, `contracts/{id}/extend`, `emporium/purchase`, `consumables/extra_slot_permit/activate`, `passport/claim/{milestone}`, `bounties/{id}/claim` | `200` (explicitly overridden) |
| `POST` | `chains/{chainKey}/start`, `chains/{chainKey}/advance`, `admin/emporium`, `admin/bounties`, `admin/bounties/{id}/publish`, `admin/bounties/{id}/archive` | `201` |
| `PATCH` | `admin/emporium/{id}`, `admin/bounties/{id}` | `200` |

All pre-existing routes keep their old success codes.

### 1.4 Additive-only compatibility guarantees

1. **`weekly_chest` legacy mapping.** `weekly_chest` stays a valid `kind`. Opening one behaves exactly like `chest_silver`: Silver bonuses, Silver pool, `chestKind: "chest_silver"` in `chestResult`. Render legacy reward keys as a Silver chest; never assume `chestResult.chestKind` equals the reward key.
2. **Existing endpoint shapes are additive.** `GET /v1/guild`, `GET /v1/guild/board`, `GET /v1/guild/contracts`, contract mutations, `GET /v1/guild/rewards` and `PATCH /v1/guild/cosmetics` keep every existing field and status; new fields are listed in section 4. Old clients that ignore unknown fields keep working.
3. **Profile reads are untouched.** `GET /v1/profile` and `GET /v1/profile/:id` still expose only `guildTitleKey` and `guildFrameKey`, read from `profile`, with **zero additional SQL statements**. Every new cosmetic/equipment field lives on `guild_profile` and is returned only by Guild routes.
4. **Existing contracts survive the migration.** `guild_board_entry.periodKey` is backfilled from `weekStart`; old contracts get `sealsReward: 0`, `bonusObjective: null`, `bonusCompleted: false`, `extendedCount: 0`, `chainProgressId: null` and remain claimable with their old rewards (including `weekly_chest`).
5. **Contract cap is additive.** Ranks `E`–`C` keep the 3-contract cap; Ranks `B`–`S` get 4, plus 1 while an `extra_slot_permit` is active (max 5). Read `license.perks.maxActiveContracts` instead of hard-coding 3.
6. **Existing members are reconciled lazily.** The first `GET /v1/guild` after deploy grants any missed Rank promotion packages for ranks already reached, once, without duplicates and without changing XP.
7. **Unknown keys must degrade gracefully.** Unknown `templateKey`, cosmetic keys, enum values, Lina triggers, bounties/quests added later: render a generic label/placeholder and keep the entry; do not drop data or crash.
8. **`lina.context` is open.** Existing context keys keep their meaning; claim context now also carries `sealsAwarded`, and a chain-completing claim also carries `chainKey`. Treat unknown context keys as additive.
9. **`claimPayload` is append-only.** Existing keys (`xpAwarded`, `globalXpAwarded`, `rankBefore`, `rankAfter`, `unlockedRewards`, `chestResult`) remain; new keys are listed in section 4.5.
10. **Board template mix changes by design.** Old clients must not assume fixed `templateKey`s or exactly 3 quests: a Rank `C+` member now gets a 4th (`cycle: "monthly"`) quest, and the weekly pool rotates over 24 templates.

## 2. Route index

`—` means no request body. `Dto[]` means a bare JSON array response (not an envelope).

| Method | Path | Success | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/guild/access` | 200 | — | `GuildAccessResponseDto` |
| `GET` | `/v1/guild` | 200 | — | `GuildOverviewResponseDto` |
| `GET` | `/v1/guild/board` | 200 | — | `GuildBoardResponseDto` |
| `POST` | `/v1/guild/board/seen` | 200 | — | `GuildBoardSeenResponseDto` |
| `GET` | `/v1/guild/contracts` | 200 | — | `GuildContractsListResponseDto` |
| `POST` | `/v1/guild/contracts` | 201 | `AcceptGuildContractDto` | `AcceptGuildContractResponseDto` |
| `POST` | `/v1/guild/contracts/{id}/claim` | 200 | — | `ClaimGuildContractResponseDto` |
| `POST` | `/v1/guild/contracts/{id}/abandon` | 200 | — | `GuildContractDto` |
| `GET` | `/v1/guild/rewards` | 200 | — | `GuildRewardsResponseDto` |
| `PATCH` | `/v1/guild/cosmetics` | 200 | `UpdateGuildCosmeticsDto` | `GuildCosmeticsResponseDto` |
| `POST` | `/v1/guild/board/{entryId}/reroll` | 200 | — | `RerollGuildBoardEntryResponseDto` |
| `POST` | `/v1/guild/contracts/{id}/extend` | 200 | — | `ExtendGuildContractResponseDto` |
| `GET` | `/v1/guild/emporium` | 200 | — | `GuildEmporiumResponseDto` |
| `POST` | `/v1/guild/emporium/purchase` | 200 | `PurchaseGuildEmporiumItemDto` | `GuildEmporiumPurchaseResponseDto` |
| `POST` | `/v1/guild/consumables/extra_slot_permit/activate` | 200 | — | `GuildExtraSlotPermitStatusDto` |
| `GET` | `/v1/guild/passport` | 200 | — | `GuildPassportResponseDto` |
| `POST` | `/v1/guild/passport/claim/{milestone}` | 200 | — | `ClaimGuildPassportMilestoneResponseDto` |
| `GET` | `/v1/guild/chains` | 200 | — | `GuildChainsResponseDto` |
| `POST` | `/v1/guild/chains/{chainKey}/start` | 201 | `StartGuildChainDto` | `GuildChainActionResponseDto` |
| `POST` | `/v1/guild/chains/{chainKey}/advance` | 201 | `AdvanceGuildChainDto` | `GuildChainActionResponseDto` |
| `GET` | `/v1/guild/bounties` | 200 | — | `GuildBountiesResponseDto` |
| `POST` | `/v1/guild/bounties/{id}/claim` | 200 | — | `ClaimGuildBountyResponseDto` |
| `GET` | `/v1/guild/admin/events` | 200 | — | `GuildAdminEventResponseDto[]` |
| `POST` | `/v1/guild/admin/events` | 201 | `CreateGuildEventDto` | `GuildAdminEventResponseDto` |
| `GET` | `/v1/guild/admin/events/{id}` | 200 | — | `GuildAdminEventResponseDto` |
| `PATCH` | `/v1/guild/admin/events/{id}` | 200 | `UpdateGuildEventDto` | `GuildAdminEventResponseDto` |
| `POST` | `/v1/guild/admin/events/{id}/publish` | 201 | — | `GuildAdminEventResponseDto` |
| `POST` | `/v1/guild/admin/events/{id}/archive` | 201 | — | `GuildAdminEventResponseDto` |
| `GET` | `/v1/guild/admin/rewards` | 200 | — | `GuildAdminRewardResponseDto[]` |
| `POST` | `/v1/guild/admin/rewards` | 201 | `CreateGuildRewardDto` | `GuildAdminRewardResponseDto` |
| `PATCH` | `/v1/guild/admin/rewards/{id}` | 200 | `UpdateGuildRewardDto` | `GuildAdminRewardResponseDto` |
| `GET` | `/v1/guild/admin/emporium` | 200 | — | `GuildAdminEmporiumItemResponseDto[]` |
| `POST` | `/v1/guild/admin/emporium` | 201 | `CreateGuildEmporiumItemDto` | `GuildAdminEmporiumItemResponseDto` |
| `PATCH` | `/v1/guild/admin/emporium/{id}` | 200 | `UpdateGuildEmporiumItemDto` | `GuildAdminEmporiumItemResponseDto` |
| `GET` | `/v1/guild/admin/bounties` | 200 | — | `GuildAdminBountyResponseDto[]` |
| `POST` | `/v1/guild/admin/bounties` | 201 | `CreateGuildBountyDto` | `GuildAdminBountyResponseDto` |
| `GET` | `/v1/guild/admin/bounties/{id}` | 200 | — | `GuildAdminBountyResponseDto` |
| `PATCH` | `/v1/guild/admin/bounties/{id}` | 200 | `UpdateGuildBountyDto` | `GuildAdminBountyResponseDto` |
| `POST` | `/v1/guild/admin/bounties/{id}/publish` | 201 | — | `GuildAdminBountyResponseDto` |
| `POST` | `/v1/guild/admin/bounties/{id}/archive` | 201 | — | `GuildAdminBountyResponseDto` |

### 2.1 Query and path parameters (delta)

| Endpoint | Parameter | Type | Rules |
| --- | --- | --- | --- |
| `GET /v1/guild/board` | `quick` | boolean-ish | Unchanged (`true`/`"true"` only); monthly expeditions participate |
| `GET /v1/guild/contracts` | `status`, `tab`, `offset`, `limit` | — | Unchanged; new statuses are not added |
| `GET /v1/guild/bounties` | `locale` | `en` \| `pt-BR` | Optional; translated `title`/`description`, base copy fallback |
| all `{id}` paths | `id` | UUID/string | Unknown/foreign → `404` |
| `POST /v1/guild/contracts/{id}/extend` | `id` | contract UUID | owned contract |
| `POST /v1/guild/board/{entryId}/reroll` | `entryId` | board entry UUID | owned board entry |
| `POST /v1/guild/passport/claim/{milestone}` | `milestone` | number | exactly `2`, `4` or `6` |
| `POST /v1/guild/chains/{chainKey}/start` | `chainKey` | string | one of the 3 chain keys |
| `POST /v1/guild/chains/{chainKey}/advance` | `chainKey` | string | one of the 3 chain keys |
| `POST /v1/guild/bounties/{id}/claim` | `id` | bounty UUID | published bounty inside its claim window |

## 3. New player endpoints

### 3.1 `POST /v1/guild/board/{entryId}/reroll`

Replaces an **open weekly** board quest (slots 0–2 of the current São Paulo week) with another eligible template. Deterministic per `(user, week, entry, rerollCount + 1)`; the entry is updated in place, so the same `boardEntryId` stays valid.

Cost: 1 free weekly reroll (Rank `D`–`A`: 1/week; Rank `S`: 2/week) or 1 `reroll_charter`. Free rerolls reset every Monday. The replacement is resolved before the profile lock (no IGDB call inside the transaction).

Response `200` `RerollGuildBoardEntryResponseDto`:

```json
{
  "quest": {
    "sourceType": "board_entry",
    "boardEntryId": "3f1c2b9e-6a5d-4c8f-9b7a-1e2d3c4b5a69",
    "cycle": "weekly",
    "category": "weekly",
    "templateKey": "campaign_rhythm",
    "rank": "D",
    "xpReward": 150,
    "sealsReward": 20,
    "objectiveType": "play_distinct_days",
    "targetCount": 4,
    "criteria": {},
    "candidateGames": [],
    "meta": null,
    "bonusObjective": null,
    "rerollCount": 1,
    "requiresTargetGame": false,
    "reward": { "id": "c87608f5-f76e-452f-afe9-6f1d70db2361", "key": "chest_bronze", "kind": "chest_bronze", "achievementId": null, "inChestPool": false, "chestBonusXp": 40, "chestBonusSeals": 15, "rarity": "common", "consumableKey": null },
    "isRecommended": false,
    "isQuick": true,
    "contractDurationDays": 7,
    "expiresAt": "2026-11-30T03:00:00.000Z"
  },
  "rerollsRemaining": 0,
  "rerollChartersOwned": 0,
  "consumableUsed": null
}
```

Rules and errors:

- Only a `cycle: "weekly"` entry of the current week, `slotIndex < 3`, not accepted (`active`/`ready_to_claim`/`completed` contract) can be rerolled → otherwise `409 code: "guild_reroll_not_available"`.
- Unknown/foreign entry → `404 code: "guild_board_entry_not_found"`.
- No free reroll and no `reroll_charter` → `409 code: "guild_reroll_unavailable"`. No eligible alternative template is also `409 guild_reroll_unavailable`.
- Monthly Expeditions and curated events cannot be rerolled. A double click may repeat one replacement (the cost is still charged once per completed call; the entry guard rejects accepted quests).

### 3.2 `POST /v1/guild/contracts/{id}/extend`

Adds 7 days to an owned `active` contract, at most once. Consumes the Rank `A`/`S` free monthly Hourglass when unused for the current São Paulo month, otherwise 1 `hourglass` consumable. Event contracts cap at `event.endsAt + 7 days`. `expiringNotifiedAt` resets so the 24h reminder can fire again for the new deadline.

Response `200` `ExtendGuildContractResponseDto`:

```json
{
  "contract": { "id": "6c5b4a39-2817-4f6e-8d9c-0b1a2c3d4e5f", "status": "active", "extendedCount": 1, "expiresAt": "2026-12-01T12:00:00.000Z" },
  "extensionDays": 7,
  "usedFreeMonthlyHourglass": false,
  "remainingHourglasses": 0
}
```

Errors: unknown/foreign → `404`; not `active` → `409 guild_contract_not_active`; already past `expiresAt` → `409 guild_contract_expired`; `extendedCount > 0` → `409 guild_contract_already_extended`; no Hourglass and no free allowance → `409 guild_consumable_not_owned`.

### 3.3 `GET /v1/guild/emporium`

Lina's Emporium. Returns `sealsBalance`, the current São Paulo `monthKey`, `nextRotationAt`, the **permanent shelf** (sorted by price then id) and **up to 6 rotating items**. The rotating selection is identical for every user in the same month: `seededOrder(sha256("emporium:" + monthKey), activeRotatingPool, id).slice(0, 6)`. Only `isActive` listings are returned.

Response `200` `GuildEmporiumResponseDto`:

```json
{
  "sealsBalance": 150,
  "monthKey": "2026-11",
  "nextRotationAt": "2026-12-01T03:00:00.000Z",
  "permanentItems": [
    {
      "id": "f2af7e19-b835-4311-89de-88148b57c07d",
      "priceSeals": 120,
      "minRank": "C",
      "isRotating": false,
      "reward": { "id": "0eb5197a-820b-488d-9147-84e3ed54b83a", "key": "license_obsidian_ledger", "kind": "license_theme", "achievementId": null, "inChestPool": false, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "epic", "consumableKey": null },
      "maxPurchasesPerMonth": null,
      "owned": false,
      "purchasedThisMonth": 0,
      "canPurchase": true
    }
  ],
  "rotatingItems": [
    {
      "id": "eabc7cef-ad53-495d-a9a3-ff3b86cd4988",
      "priceSeals": 150,
      "minRank": "C",
      "isRotating": true,
      "reward": { "id": "b35a5e5b-d985-4863-b548-1cd0f8340807", "key": "license_autumn_ledger", "kind": "license_theme", "achievementId": null, "inChestPool": false, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "rare", "consumableKey": null },
      "maxPurchasesPerMonth": null,
      "owned": false,
      "purchasedThisMonth": 0,
      "canPurchase": false
    }
  ]
}
```

Listing semantics:

- `owned`: true only for permanent equippables (`title`, `avatar_frame`, `license_theme`, `stamp_style`, `tavern_decor`, `badge`). Consumables and chests are repeatable and always `owned: false`.
- `purchasedThisMonth`: purchases of this listing by this user in the current `monthKey`.
- `canPurchase`: not owned **and** (`maxPurchasesPerMonth` is null or not reached) **and** `rank >= minRank` **and** `sealsBalance >= priceSeals`. It is a hint; the server revalidates atomically.
- A rotating listing that is not in the current month's 6-item showcase behaves as `404` on purchase.
- This read does not create a Guild profile; a brand-new user sees `sealsBalance: 0` and Rank `E` affordability.

### 3.4 `POST /v1/guild/emporium/purchase`

Body `PurchaseGuildEmporiumItemDto`:

```json
{ "emporiumItemId": "f2af7e19-b835-4311-89de-88148b57c07d" }
```

Atomically locks `guild_profile`, then the listing, then debits Seals, records `guild_emporium_purchase`, grants the reward (cosmetic unlock, consumable quantity, chest opening, or badge tiers) and appends the Seals ledger row (`reason: "emporium_purchase"`).

Response `200` `GuildEmporiumPurchaseResponseDto`:

```json
{
  "itemId": "f2af7e19-b835-4311-89de-88148b57c07d",
  "priceSeals": 120,
  "sealsBalance": 30,
  "reward": { "id": "0eb5197a-820b-488d-9147-84e3ed54b83a", "key": "license_obsidian_ledger", "kind": "license_theme", "achievementId": null, "inChestPool": false, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "epic", "consumableKey": null },
  "chestResult": null,
  "consumables": { "hourglass": 1, "reroll_charter": 0, "extra_slot_permit": 0 }
}
```

Errors: unknown/inactive/not-in-showcase listing → `404`; rank too low → `403 guild_emporium_rank_required`; already owned → `409 guild_emporium_already_owned`; monthly cap reached → `409 guild_emporium_monthly_limit_reached`; `sealsBalance < priceSeals` → `409 guild_insufficient_seals`. Rank/ownership/cap failures leave the balance unchanged.

### 3.5 `POST /v1/guild/consumables/extra_slot_permit/activate`

Consumes 1 `extra_slot_permit` and sets `extraSlotPermitWeekStart` to the current São Paulo week. The extra contract slot lasts until the next Monday rollover.

Response `200` `GuildExtraSlotPermitStatusDto`:

```json
{
  "weekStart": "2026-11-23",
  "activeThisWeek": true,
  "expiresAt": "2026-11-30T03:00:00.000Z",
  "remainingPermits": 0
}
```

Errors: already active this week → `409 guild_permit_already_active`; none owned → `409 guild_consumable_not_owned`.

### 3.6 `GET /v1/guild/passport`

Monthly Guild Passport stamps. One stamp is added atomically whenever a Guild contract is claimed, for the São Paulo month of `claimedAt`.

Response `200` `GuildPassportResponseDto`:

```json
{
  "monthKey": "2026-11",
  "completedContractsCount": 3,
  "resetsAt": "2026-12-01T03:00:00.000Z",
  "milestones": [
    { "milestone": 2, "status": "claimed", "chestKind": "chest_bronze", "sealsReward": 25, "consumableKey": null, "consumableQuantity": 0 },
    { "milestone": 4, "status": "claimable", "chestKind": "chest_silver", "sealsReward": 50, "consumableKey": null, "consumableQuantity": 0 },
    { "milestone": 6, "status": "locked", "chestKind": "chest_gold", "sealsReward": 100, "consumableKey": "hourglass", "consumableQuantity": 1 }
  ]
}
```

Milestones are always returned in ascending order (`2`, `4`, `6`). A new month starts at count 0 and no claimed milestones.

### 3.7 `POST /v1/guild/passport/claim/{milestone}`

Claims one milestone once per month. Grants the chest, flat Seals, and the Hourglass for milestone `6`, all inside one transaction.

Response `200` `ClaimGuildPassportMilestoneResponseDto`:

```json
{
  "monthKey": "2026-11",
  "milestone": 4,
  "claimedMilestones": [2, 4],
  "completedContractsCount": 4,
  "chestResult": { "chestKind": "chest_silver", "bonusXp": 75, "bonusSeals": 30, "unlockedCosmetic": { "id": "9194384d-d6d1-487c-8728-daa13bebc6e0", "key": "frame_owl_wing", "kind": "avatar_frame", "achievementId": null, "inChestPool": true, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "uncommon", "consumableKey": null }, "grantedConsumable": null },
  "sealsAwarded": 80,
  "consumableKey": null,
  "consumableQuantity": 0,
  "xpAwarded": 75,
  "globalXpAwarded": 18,
  "rankBefore": "C",
  "rankAfter": "C"
}
```

`sealsAwarded` = flat milestone Seals + chest Seal payout. `xpAwarded` = chest Guild XP; `globalXpAwarded = floor(xpAwarded × 0.25)`.
Errors: milestone other than `2`/`4`/`6` → `400 guild_passport_invalid_milestone`; not enough stamps → `409 guild_passport_milestone_not_reached`; already claimed → `409 guild_passport_milestone_already_claimed`.

### 3.8 `GET /v1/guild/chains`

Returns the 3-stage narrative arcs. A chain's list `status` is `locked` (rank too low), `available` (never started), `in_progress`, or `completed`. Locked chains still include their stage definitions so clients can preview them.

Response `200` `GuildChainsResponseDto`:

```json
{
  "chains": [
    {
      "chainKey": "pathfinders_arc",
      "titleKey": "guild_chain_pathfinders_arc_title",
      "minRank": "E",
      "status": "in_progress",
      "currentStageIndex": 1,
      "totalStages": 3,
      "boundTargetGameId": 1029,
      "boundGame": { "gameId": 1029, "name": "Celeste", "slug": "celeste", "coverUrl": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg" },
      "activeContractId": "6c5b4a39-2817-4f6e-8d9c-0b1a2c3d4e5f",
      "stages": [
        { "index": 0, "stageKey": "trail_head", "objectiveType": "log_playtime", "targetCount": 120, "criteria": {}, "xpReward": 100, "sealsReward": 15, "durationDays": 21, "usesBoundTargetGame": true },
        { "index": 1, "stageKey": "summit_push", "objectiveType": "finish_game", "targetCount": 1, "criteria": {}, "xpReward": 180, "sealsReward": 25, "durationDays": 21, "usesBoundTargetGame": true },
        { "index": 2, "stageKey": "field_notes", "objectiveType": "write_review", "targetCount": 1, "criteria": { "minReviewChars": 80 }, "xpReward": 260, "sealsReward": 35, "durationDays": 21, "usesBoundTargetGame": true }
      ],
      "finalRewards": [
        { "id": "63c73e14-2126-4b42-8015-b6e06f156e52", "key": "title_pathfinder", "kind": "title", "achievementId": null, "inChestPool": false, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "rare", "consumableKey": null },
        { "id": "3519370b-fd39-4bd2-9a43-5e36b098ad01", "key": "decor_compass_rose", "kind": "tavern_decor", "achievementId": null, "inChestPool": false, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "epic", "consumableKey": null }
      ],
      "finalBonusSeals": 100
    }
  ]
}
```

`currentStageIndex` is the stage currently being attempted (or next to start/retry). Once `completed`, `currentStageIndex` stays on the final stage index.

### 3.9 `POST /v1/guild/chains/{chainKey}/start`

Body `StartGuildChainDto` (optional):

```json
{ "targetGameId": 1029 }
```

`targetGameId` is required when Stage 1 uses a bound game (`pathfinders_arc`) and is validated against the stage criteria/ownership. It is inherited by every later stage of that chain. Creates `guild_user_chain` and the Stage 1 contract (`chainProgressId` set), consuming a personal contract slot.

Response `201` `GuildChainActionResponseDto`: `{ "chain": GuildChainDto, "contractId": "..." }`.

Errors: unknown chain → `404` (no code); already started → `409 guild_chain_already_started`; already completed → `409 guild_chain_already_completed`; rank too low → `403 guild_chain_rank_required`; active contract cap → `409 guild_active_contract_limit_reached`; invalid/missing target game → `400`.

### 3.10 `POST /v1/guild/chains/{chainKey}/advance`

Starts the next stage after the previous stage contract was claimed. For chains that use the bound game, the game is inherited automatically; `targetGameId` is only needed to fill a missing binding. Abandoning/expiring a stage leaves `currentStageIndex` on the same stage, so `advance` retries it without losing earlier stages.

Response `201` `GuildChainActionResponseDto` (same shape as start).

Errors: chain not started → `404`; already completed → `409 guild_chain_already_completed`; current stage still `active`/`ready_to_claim` → `409 guild_chain_stage_active`; active cap → `409 guild_active_contract_limit_reached`; invalid/missing target → `400`.

### 3.11 `GET /v1/guild/bounties`

Lists published Community Bounties that are active or **ended within the last 14 days** (claim window). Optional `?locale=en|pt-BR` selects the translation; otherwise the base copy is returned.

Response `200` `GuildBountiesResponseDto`:

```json
{
  "bounties": [
    {
      "id": "3ab3b3f0-1d2b-4a2f-8f2f-58f4d5f6a7b8",
      "slug": "spooky-october-2026",
      "title": "Spooky October",
      "description": "Finish a horror game this month.",
      "objectiveType": "finish_game",
      "targetTotal": 500,
      "currentTotal": 320,
      "progressPercent": 64,
      "startsAt": "2026-10-01T03:00:00.000Z",
      "endsAt": "2026-11-01T02:59:59.000Z",
      "status": "published",
      "userContribution": 2,
      "minUserContribution": 1,
      "eligible": true,
      "claimedMilestones": [25],
      "milestones": [
        { "milestone": 25, "unlocked": true, "claimed": true, "claimable": false, "sealsReward": 25, "xpReward": 0, "rewardId": null, "chestKind": null },
        { "milestone": 50, "unlocked": true, "claimed": false, "claimable": true, "sealsReward": 50, "xpReward": 0, "rewardId": null, "chestKind": null },
        { "milestone": 100, "unlocked": false, "claimed": false, "claimable": false, "sealsReward": 100, "xpReward": 0, "rewardId": null, "chestKind": "chest_gold" },
        { "milestone": 150, "unlocked": false, "claimed": false, "claimable": false, "sealsReward": 0, "xpReward": 0, "rewardId": null, "chestKind": null }
      ],
      "hasClaimableMilestones": true
    }
  ]
}
```

`progressPercent = floor(currentTotal × 100 / targetTotal)` and may exceed `100` on overkill. `unlocked` means the shared goal reached that milestone; `claimable` additionally requires `eligible` and not yet claimed. Bounties never consume a personal contract slot.

### 3.12 `POST /v1/guild/bounties/{id}/claim`

Atomically claims **all** unlocked, unclaimed milestones for an eligible contributor. Repeat calls after everything is claimed fail with `409`; non-contributors get `403`.

Response `200` `ClaimGuildBountyResponseDto`:

```json
{
  "bountyId": "3ab3b3f0-1d2b-4a2f-8f2f-58f4d5f6a7b8",
  "claimedMilestones": [25, 50, 100],
  "newlyClaimedMilestones": [50, 100],
  "sealsAwarded": 210,
  "xpAwarded": 125,
  "globalXpAwarded": 31,
  "rankBefore": "C",
  "rankAfter": "C",
  "unlockedRewards": [],
  "chestResults": [{ "chestKind": "chest_gold", "bonusXp": 125, "bonusSeals": 60, "unlockedCosmetic": { "id": "33f391af-2497-45e4-b65a-fb24c628c133", "key": "frame_ruby_sigil", "kind": "avatar_frame", "achievementId": null, "inChestPool": true, "chestBonusXp": 0, "chestBonusSeals": 0, "rarity": "rare", "consumableKey": null }, "grantedConsumable": "reroll_charter" }]
}
```

Errors: unknown bounty → `404`; outside the published `[startsAt, endsAt + 14d]` window → `409 guild_bounty_not_claimable`; contribution below `minUserContribution` → `403 guild_bounty_not_eligible`; nothing newly claimable → `409 guild_bounty_nothing_to_claim`.

## 4. Updated player endpoints (all changes additive)

### 4.1 `GET /v1/guild`

`GuildOverviewResponseDto` keeps all old fields and adds:

- `license.sealsBalance`, `license.prestigeLevel`, `license.prestigeXpIntoCurrent`, `license.xpToNextPrestige`, `license.perks` (full `GuildLicensePerksDto`), `license.equippedLicenseThemeKey`, `license.equippedStampStyleKey`, `license.equippedDecorKeys`, `license.showcaseBadgeIds`.
- `passport` (`GuildPassportSummaryDto`), `activeChain` (`GuildActiveChainSummaryDto` or `null`), `activeBountiesCount` (published bounties with `endsAt > now`; the 14-day claim window is not counted).

Behavior kept: lazy profile creation, inline contract evaluation before responding, `lastVisitedAt` update after the inactivity check, board NOT marked seen. New: on read, missed Rank promotion packages for already-reached ranks are reconciled once (idempotent) before the license is rendered.

Lina reception priority on this route (first match wins):

| Priority | `trigger` | `pose` | `context` |
| --- | --- | --- | --- |
| 1 | `contract_ready_to_claim` | `happy` | `{ contractId, category, templateKey, eventId, targetGameId, targetGameName? }` |
| 2 | `community_bounty_ready` | `happy` | `{}` — at least one Community Bounty has a claimable milestone for this user |
| 3 | `returning_after_inactivity` | `neutral` | `{ inactiveDays }` |
| 4 | `weekly_board_refreshed` | `neutral` | `{}` |
| 5 | `monthly_expedition_refreshed` | `neutral` | `{}` — Rank `C+`, previous visit was in an earlier São Paulo month |
| 6 | `stale_backlog_game` | `neutral` | `{ gameId, gameName, sinceYear }` |
| 7 | `default` | `neutral` | `{}` |

`hasUnseenBoard` semantics are unchanged (never seen, before the current Monday cycle, or an active event published after the last acknowledgement).

Additive overview example (only new fields shown):

```json
{
  "license": {
    "sealsBalance": 150,
    "prestigeLevel": 1,
    "prestigeXpIntoCurrent": 800,
    "xpToNextPrestige": 1700,
    "perks": { "maxActiveContracts": 4, "weeklyRerolls": 1, "monthlyExpedition": true, "monthlyExpeditionRankS": false, "monthlyFreeHourglass": 0, "legendaryContracts": false },
    "equippedLicenseThemeKey": "license_obsidian_ledger",
    "equippedStampStyleKey": "stamp_gold_seal",
    "equippedDecorKeys": ["decor_sleeping_cat"],
    "showcaseBadgeIds": ["guild-archaeologist"]
  },
  "passport": { "monthKey": "2026-11", "completedContractsCount": 3, "claimableMilestones": [4] },
  "activeChain": { "chainKey": "pathfinders_arc", "status": "in_progress", "currentStageIndex": 1, "totalStages": 3, "boundTargetGameId": 1029, "activeContractId": "6c5b4a39-2817-4f6e-8d9c-0b1a2c3d4e5f" },
  "activeBountiesCount": 2
}
```

### 4.2 `GET /v1/guild/board`

`GuildBoardResponseDto` keeps `weekStart`, `nextRefreshAt`, `quests` and adds:

- `rerollsRemaining` (free weekly rerolls left: `0` at E, `1` at D–A, `2` at S)
- `rerollChartersOwned`
- `monthlyExpeditionLocked` (`true` below Rank `C`)

Every quest adds `cycle`, `sealsReward`, `bonusObjective`, `rerollCount` and possibly the procedural `meta` keys `genreName`, `franchiseName`, `themeName`, `decade`, `staleDays` (in addition to `sinceYear`, `estimatedHours`). Monthly Expedition quests have `category: "monthly"`, `cycle: "monthly"`, are identified by `boardEntryId`, and have `expiresAt` = next month reset (last moment to accept). Once accepted, the contract gets its full `contractDurationDays` from `acceptedAt`.

Behavior details:

- Weekly board: 3 persisted slots per Monday; `library` (procedural/backlog), `weekly` (gameplay/playtime/achievements) and `gamenode` (reviews/Daily/collections/posts/triage). Empty library still produces 3 valid quests.
- Rank `C+`: a 4th persisted Monthly Expedition for the current `monthKey` (`slotIndex: 3`, stable all month). Ranks `C`–`B` roll Rank `A` templates; Ranks `A`–`S` also include Rank `S` templates (the `monthlyExpeditionRankS` perk). Ranks `E`–`D`: none and `monthlyExpeditionLocked: true`.
- Curated events are merged live and have `cycle: null`; their `expiresAt` is `event.endsAt` and `contractDurationDays` is `null`.
- `isRecommended` priority is unchanged (first open library → first open event → first open weekly); monthly expeditions are not recommended.
- `quick=true` keeps only `isQuick` quests, easiest rank first; monthly expeditions can be quick only if their template says so (none currently).
- Bonus objectives are deterministic and attached to ~50% of compatible slots. They never block base completion. A client must show them as optional and reflect `bonusCompleted` after claim.

### 4.3 `GET /v1/guild/contracts` and `GuildContractDto`

Query and pagination are unchanged. Contract shape additions:

- `sealsReward`, `bonusObjective`, `bonusCompleted`, `extendedCount`, `chainProgressId`
- `playtimeProgress` remains only for `active` `finish_game` contracts with a target game.
- `claimPayload` keeps its old keys and gains the new ones (see 4.5).
- `category` can now be `monthly`; `templateKey` can be any of the 31 templates or `null` for events.

Accepted ordering, `tab`/`status` precedence and pagination are unchanged.

### 4.4 `POST /v1/guild/contracts` (accept)

Request body is unchanged (`boardEntryId` xor `eventId`, optional `targetGameId`). New rules:

- The active cap is read from `license.perks.maxActiveContracts` (3 at `E`–`C`, 4 at `B`–`S`, 5 with an active permit). Over the cap → `409 guild_active_contract_limit_reached`.
- `targetGameId` is validated against every extended criterion (`minTimeToBeatHours`, `releaseYearMin/Max`, `franchiseIds`, `platformIds`, `gameCategories`, `indieOnly`, plus the existing ids/TTB/status rules). Mismatch → `400` with a plain message.
- Multi-target `finish_game` quests (`targetCount > 1`, e.g. `double_feature`, `genre_marathon`, `saga_trilogy`) still cannot be bound to a single `targetGameId`.
- Response `201` is `AcceptGuildContractResponseDto` with the enriched `GuildContractDto` and `lina.trigger: "contract_accepted"`.

### 4.5 `POST /v1/guild/contracts/{id}/claim`

Response `ClaimGuildContractResponseDto` keeps `contract`, `xpAwarded`, `globalXpAwarded`, `rankBefore`, `rankAfter`, `unlockedRewards`, `chestResult`, `lina`, and adds:

- `sealsAwarded`: every Seal credited by this claim — contract Seals + bonus objective + chest payout + Prestige + chain-completion bonus.
- `bonusCompleted`: whether the optional bonus objective was satisfied.
- `promotionRewards`: cosmetics granted by Rank packages crossed by this claim (possibly several).
- `prestigeRewards`: one `GuildChestResultDto` per newly reached Prestige star (Relic chests).
- `passportMonth`: `{ monthKey, completedContractsCount }` after the stamp.
- `chainProgress`: `GuildChainClaimProgressDto` or `null`; non-null when the claimed contract belongs to a chain.

Claim-time behavior:

- `weekly_chest` opens as Silver (same bonuses/pool) and reports `chestKind: "chest_silver"`.
- Duplicate badge rewards grant `+50` Guild XP and `+25` Guild Seals; `unlockedRewards` omits the already-owned badge.
- Exhausted chest pools convert the cosmetic slot to extra XP/Seals (section 8.6).
- Bonus objectives are re-checked at claim time (`also_write_review`, `finish_before_half_deadline`, `use_stale_backlog_game`), so a review written after finishing the game still counts.
- `chain_completed` takes precedence over `rank_promoted`, which takes precedence over `contract_claimed` in `lina.trigger`.
- `lina.context` for claims: `{ contractId, xpAwarded, sealsAwarded, rankBefore, rankAfter, rankedUp }` plus `chainKey` when the claimed stage completed the arc. `pose: "happy"`.

### 4.6 `POST /v1/guild/contracts/{id}/abandon`

Unchanged contract (`GuildContractDto` with `status: "abandoned"`), same `404`/`409 guild_contract_not_active`. New additive contract fields apply. Abandoning a chain stage keeps chain progress retryable.

### 4.7 `GET /v1/guild/rewards`

Keeps `unlockedRewards`, `equippedTitleKey`, `equippedFrameKey` and adds:

- `equippedLicenseThemeKey`, `equippedStampStyleKey`, `equippedDecorKeys`, `showcaseBadgeIds`
- `sealsBalance`
- `consumables`: `{ hourglass, reroll_charter, extra_slot_permit }`

Each `UserGuildRewardDto.reward` descriptor keeps its old fields and adds `chestBonusSeals`, `rarity`, `consumableKey`. `unlockedRewards` remains ordered by `unlockedAt` DESC and includes every permanently unlocked cosmetic kind. Chests/consumables are **not** listed here; consumables are exposed through `consumables` and chests are claim-time receipts.

### 4.8 `PATCH /v1/guild/cosmetics`

Body `UpdateGuildCosmeticsDto` keeps `guildTitleKey`/`guildFrameKey` and adds these optional fields (omitted = keep, `null` = unequip/clear):

- `equippedLicenseThemeKey`: 1–64 chars, must own a `license_theme`.
- `equippedStampStyleKey`: 1–64 chars, must own a `stamp_style`.
- `equippedDecorKeys`: array of 1–64-char keys, max 4, unique, each must own a `tavern_decor`.
- `showcaseBadgeIds`: array of 1–64-char achievement definition ids, max 3, unique, each owned by the user.

Response is the full equipped state: `{ guildTitleKey, guildFrameKey, equippedLicenseThemeKey, equippedStampStyleKey, equippedDecorKeys, showcaseBadgeIds }`.

Errors: not owned/wrong kind/wrong badge → `403 guild_cosmetic_not_owned` (nothing changes); too many or duplicate array entries → `400 guild_cosmetic_limit_exceeded` (and class-validator bounds also return `400`). `null` clears; arrays are written atomically after validating every key.

## 5. DTO reference

Field tables below are complete for every DTO whose shape changed. Unchanged DTOs are referenced by name in the old hand-off and are not repeated:

`GuildAccessResponseDto`, `GuildBoardSeenResponseDto`, `GuildLicenseStatsDto`, `GuildYearGoalDto`, `GetGuildBoardQueryDto`, `GuildBoardCandidateGameDto`, `GuildBoardEventTranslationDto`, `AcceptGuildContractDto`, `GetGuildContractsQueryDto`, `GuildContractsListResponseDto`, `GuildContractTargetGameDto`, `GuildContractPlaytimeProgressDto`, `GuildContractEventSummaryDto`, `UserGuildRewardDto`, `GetGuildBountiesQueryDto`, `GuildEventTranslationDto`, `NotificationGuildTargetDto` (contract-target variant).

### DTO: `GuildOverviewResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `license` | `GuildLicenseDto` | See below |
| `activeContracts` | `GuildContractDto[]` | `active` + `ready_to_claim`, ready first |
| `yearGoal` | `GuildYearGoalDto \| null` | Unchanged |
| `counts` | `GuildOverviewCountsDto` | `boardCount` = open quests now |
| `weekStart` | string | São Paulo Monday |
| `nextRefreshAt` | Date | Next Monday 00:00 São Paulo in UTC |
| `lina` | `LinaReceptionDto` | Section 4.1 priority |
| `passport` | `GuildPassportSummaryDto` | New |
| `activeChain` | `GuildActiveChainSummaryDto \| null` | New |
| `activeBountiesCount` | number | New |

### DTO: `GuildLicenseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `licenseNumber` | number | Member number |
| `rank` | rank | `E`–`S` |
| `xp` | number | Cumulative Guild XP |
| `currentRankMinXp` | number | |
| `nextRank` | rank \| null | `null` at `S` |
| `nextRankXp` | number \| null | |
| `xpToNextRank` | number | `0` at `S` |
| `memberSince` | Date | |
| `equippedTitleKey` | string \| null | Mirrors `guildTitleKey` |
| `equippedFrameKey` | string \| null | Mirrors `guildFrameKey` |
| `sealsBalance` | number | Guild Seals |
| `prestigeLevel` | number | Prestige stars above 7,500 XP |
| `prestigeXpIntoCurrent` | number | XP into the current star |
| `xpToNextPrestige` | number | XP until the next star |
| `perks` | `GuildLicensePerksDto` | |
| `equippedLicenseThemeKey` | string \| null | |
| `equippedStampStyleKey` | string \| null | |
| `equippedDecorKeys` | string[] | Up to 4 |
| `showcaseBadgeIds` | string[] | Up to 3 |
| `stats` | `GuildLicenseStatsDto` | Unchanged |

### DTO: `GuildLicensePerksDto`

| Field | Type | Notes |
| --- | --- | --- |
| `maxActiveContracts` | number | 3 (`E`–`C`), 4 (`B`–`S`), 5 with an active permit |
| `weeklyRerolls` | number | 0/1/2 by rank |
| `monthlyExpedition` | boolean | Rank `C+` |
| `monthlyExpeditionRankS` | boolean | Rank `A+` includes Rank `S` expedition templates |
| `monthlyFreeHourglass` | number | 1 at `A`/`S` |
| `legendaryContracts` | boolean | `true` at `S`; the Rank `S` expedition pool itself is enabled by `monthlyExpeditionRankS` |

### DTO: `LinaReceptionDto`

| Field | Type | Notes |
| --- | --- | --- |
| `trigger` | `LinaTrigger` | 7 overview values + 4 new triggers |
| `pose` | `happy \| neutral` | |
| `context` | object | Trigger-specific; additive |
| `hasUnseenBoard` | boolean | |

### DTO: `GuildPassportSummaryDto`

| Field | Type | Notes |
| --- | --- | --- |
| `monthKey` | string | `YYYY-MM` |
| `completedContractsCount` | number | |
| `claimableMilestones` | number[] | Ascending |

### DTO: `GuildActiveChainSummaryDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chainKey` | chain key | |
| `status` | `in_progress \| completed` | Persisted status |
| `currentStageIndex` | number | |
| `totalStages` | number | Always 3 |
| `boundTargetGameId` | number \| null | |
| `activeContractId` | string \| null | |

### DTO: `GuildBoardResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `weekStart` | string | |
| `nextRefreshAt` | Date | |
| `rerollsRemaining` | number | New |
| `rerollChartersOwned` | number | New |
| `monthlyExpeditionLocked` | boolean | New |
| `quests` | `GuildBoardQuestDto[]` | |

### DTO: `GuildBoardQuestDto`

| Field | Type | Notes |
| --- | --- | --- |
| `sourceType` | `board_entry \| event` | |
| `boardEntryId` | string \| null | |
| `eventId` | string \| null | |
| `slug` | string \| null | Events only |
| `category` | category | Includes `monthly` |
| `cycle` | `weekly \| monthly \| null` | New; `null` for events |
| `templateKey` | string \| null | One of 31 templates, or null for events |
| `title` | string \| null | Events only |
| `description` | string \| null | Events only |
| `translations` | `GuildBoardEventTranslationDto[]` | |
| `rank` | rank | |
| `xpReward` | number | |
| `sealsReward` | number | New |
| `objectiveType` | objective | 10 values |
| `targetCount` | number | |
| `criteria` | object | Extended criteria |
| `candidateGames` | `GuildBoardCandidateGameDto[]` | Up to 3 |
| `meta` | `GuildBoardQuestMetaDto \| null` | New keys |
| `bonusObjective` | `GuildBoardBonusObjectiveDto \| null` | New |
| `rerollCount` | number | New |
| `requiresTargetGame` | boolean | |
| `reward` | `GuildRewardDescriptorDto \| null` | |
| `isRecommended` | boolean | |
| `isQuick` | boolean | |
| `contractDurationDays` | number \| null | |
| `expiresAt` | Date | Last accept moment |

### DTO: `GuildBoardQuestMetaDto`

| Field | Type | Notes |
| --- | --- | --- |
| `sinceYear` | number \| null | Legacy stale-backlog chip |
| `estimatedHours` | number \| null | Cached TTB |
| `genreName` | string \| null | New; `off_the_map`, `genre_marathon` |
| `franchiseName` | string \| null | New; `continue_the_saga` |
| `themeName` | string \| null | New; `saga_trilogy` theme branch |
| `decade` | string \| null | New; `time_machine` |
| `staleDays` | number \| null | New; `recent_dust`, `forgotten_relic`, `ancient_fossil` |

### DTO: `GuildBoardBonusObjectiveDto`

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `also_write_review \| finish_before_half_deadline \| use_stale_backlog_game` | |
| `minChars` | number | Optional; `also_write_review`, default 150 |
| `staleDays` | number | Optional; `use_stale_backlog_game`, default 180 |
| `bonusXp` | number | Optional |
| `bonusSeals` | number | Optional |
| `upgradeChestTier` | boolean | Optional; one-tier chest upgrade |

### DTO: `RerollGuildBoardEntryResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `quest` | `GuildBoardQuestDto` | Replacement quest |
| `rerollsRemaining` | number | |
| `rerollChartersOwned` | number | |
| `consumableUsed` | `hourglass \| reroll_charter \| extra_slot_permit \| null` | Practically `reroll_charter` or null |

### DTO: `GuildContractDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `boardEntryId` | string \| null | |
| `eventId` | string \| null | |
| `category` | category | Includes `monthly` |
| `templateKey` | string \| null | |
| `rank` | rank | |
| `xpReward` | number | Base Guild XP |
| `sealsReward` | number | Base Seals |
| `objectiveType` | objective | |
| `criteria` | object | |
| `bonusObjective` | object \| null | `GuildBonusObjective` |
| `bonusCompleted` | boolean | |
| `extendedCount` | number | `0` or `1` |
| `chainProgressId` | string \| null | |
| `targetGameId` | number \| null | |
| `targetGame` | `GuildContractTargetGameDto \| null` | |
| `progressCurrent` | number | |
| `progressTarget` | number | |
| `status` | contract status | |
| `playtimeProgress` | `GuildContractPlaytimeProgressDto \| null` | |
| `reward` | `GuildRewardDescriptorDto \| null` | |
| `event` | `GuildContractEventSummaryDto \| null` | |
| `claimPayload` | object \| null | Section 4.5 |
| `acceptedAt` | Date | |
| `readyAt` | Date \| null | |
| `claimedAt` | Date \| null | |
| `expiresAt` | Date \| null | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### DTO: `ClaimGuildContractResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `contract` | `GuildContractDto` | Completed contract |
| `xpAwarded` | number | Guild XP incl. bonuses |
| `globalXpAwarded` | number | `floor(xpAwarded × 0.25)` |
| `rankBefore` | rank | |
| `rankAfter` | rank | |
| `sealsAwarded` | number | All Seals from this claim |
| `bonusCompleted` | boolean | |
| `unlockedRewards` | `GuildRewardDescriptorDto[]` | Newly granted only |
| `chestResult` | `GuildChestResultDto \| null` | |
| `promotionRewards` | `GuildRewardDescriptorDto[]` | Rank packages crossed |
| `prestigeRewards` | `GuildChestResultDto[]` | One Relic chest per star |
| `passportMonth` | `GuildContractPassportMonthDto` | |
| `chainProgress` | `GuildChainClaimProgressDto \| null` | |
| `lina` | `LinaReceptionDto` | |

### DTO: `GuildContractPassportMonthDto`

| Field | Type | Notes |
| --- | --- | --- |
| `monthKey` | string | |
| `completedContractsCount` | number | |

### DTO: `ExtendGuildContractResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `contract` | `GuildContractDto` | Updated contract |
| `extensionDays` | number | Always 7 |
| `usedFreeMonthlyHourglass` | boolean | |
| `remainingHourglasses` | number | |

### DTO: `GuildChestResultDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chestKind` | `chest_bronze \| chest_silver \| chest_gold \| chest_relic` | Legacy `weekly_chest` resolves to `chest_silver` |
| `bonusXp` | number | Tier XP + exhausted bonus |
| `bonusSeals` | number | Tier Seals + exhausted bonus |
| `unlockedCosmetic` | `GuildRewardDescriptorDto \| null` | `null` when the pool is exhausted |
| `grantedConsumable` | consumable \| null | Gold 35% / Relic guaranteed |

### DTO: `GuildRewardDescriptorDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Reward UUID |
| `key` | string | Stable cosmetic/consumable key |
| `kind` | reward kind | 12 values |
| `achievementId` | string \| null | Badges only |
| `inChestPool` | boolean | |
| `chestBonusXp` | number | |
| `chestBonusSeals` | number | New |
| `rarity` | rarity | New |
| `consumableKey` | consumable \| null | New |

### DTO: `GuildRewardsResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `unlockedRewards` | `UserGuildRewardDto[]` | `unlockedAt` DESC |
| `equippedTitleKey` | string \| null | |
| `equippedFrameKey` | string \| null | |
| `equippedLicenseThemeKey` | string \| null | New |
| `equippedStampStyleKey` | string \| null | New |
| `equippedDecorKeys` | string[] | New |
| `showcaseBadgeIds` | string[] | New |
| `sealsBalance` | number | New |
| `consumables` | `GuildConsumableBalancesDto` | New |

### DTO: `GuildConsumableBalancesDto`

| Field | Type | Notes |
| --- | --- | --- |
| `hourglass` | number | |
| `reroll_charter` | number | |
| `extra_slot_permit` | number | |

### DTO: `UpdateGuildCosmeticsDto`

| Field | Type | Notes |
| --- | --- | --- |
| `guildTitleKey` | string \| null | 1–64 chars; omitted keeps |
| `guildFrameKey` | string \| null | 1–64 chars |
| `equippedLicenseThemeKey` | string \| null | 1–64 chars |
| `equippedStampStyleKey` | string \| null | 1–64 chars |
| `equippedDecorKeys` | string[] \| null | max 4, unique |
| `showcaseBadgeIds` | string[] \| null | max 3, unique |

### DTO: `GuildCosmeticsResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `guildTitleKey` | string \| null | |
| `guildFrameKey` | string \| null | |
| `equippedLicenseThemeKey` | string \| null | |
| `equippedStampStyleKey` | string \| null | |
| `equippedDecorKeys` | string[] | |
| `showcaseBadgeIds` | string[] | |

### DTO: `GuildEmporiumResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `sealsBalance` | number | |
| `monthKey` | string | |
| `nextRotationAt` | Date | |
| `permanentItems` | `GuildEmporiumListingDto[]` | |
| `rotatingItems` | `GuildEmporiumListingDto[]` | Up to 6, same for all users in the month |

### DTO: `GuildEmporiumListingDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Listing id (use this for purchase) |
| `priceSeals` | number | |
| `minRank` | rank | |
| `isRotating` | boolean | |
| `reward` | `GuildRewardDescriptorDto` | |
| `maxPurchasesPerMonth` | number \| null | |
| `owned` | boolean | Permanent equippables only |
| `purchasedThisMonth` | number | |
| `canPurchase` | boolean | Hint |

### DTO: `PurchaseGuildEmporiumItemDto`

| Field | Type | Notes |
| --- | --- | --- |
| `emporiumItemId` | string | UUID of the listing |

### DTO: `GuildEmporiumPurchaseResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `itemId` | string | |
| `priceSeals` | number | |
| `sealsBalance` | number | After debit |
| `reward` | `GuildRewardDescriptorDto` | |
| `chestResult` | `GuildChestResultDto \| null` | Chest listings only |
| `consumables` | `GuildConsumableBalancesDto` | After grant |

### DTO: `GuildExtraSlotPermitStatusDto`

| Field | Type | Notes |
| --- | --- | --- |
| `weekStart` | string | |
| `activeThisWeek` | boolean | |
| `expiresAt` | Date | Next Monday 00:00 São Paulo |
| `remainingPermits` | number | |

### DTO: `GuildPassportResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `monthKey` | string | |
| `completedContractsCount` | number | |
| `resetsAt` | Date | |
| `milestones` | `GuildPassportMilestoneDto[]` | 2, 4, 6 |

### DTO: `GuildPassportMilestoneDto`

| Field | Type | Notes |
| --- | --- | --- |
| `milestone` | number | `2`, `4`, `6` |
| `status` | `locked \| claimable \| claimed` | |
| `chestKind` | chest tier | |
| `sealsReward` | number | Flat milestone Seals |
| `consumableKey` | consumable \| null | `hourglass` at 6 |
| `consumableQuantity` | number | |

### DTO: `ClaimGuildPassportMilestoneResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `monthKey` | string | |
| `milestone` | number | |
| `claimedMilestones` | number[] | After claim |
| `completedContractsCount` | number | |
| `chestResult` | `GuildChestResultDto` | |
| `sealsAwarded` | number | Flat + chest |
| `consumableKey` | consumable \| null | |
| `consumableQuantity` | number | |
| `xpAwarded` | number | Chest Guild XP |
| `globalXpAwarded` | number | `floor(xpAwarded × 0.25)` |
| `rankBefore` | rank | |
| `rankAfter` | rank | |

### DTO: `GuildChainsResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chains` | `GuildChainDto[]` | Always 3, catalog order |

### DTO: `GuildChainDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chainKey` | chain key | |
| `titleKey` | string | Localization key |
| `minRank` | rank | |
| `status` | `locked \| available \| in_progress \| completed` | |
| `currentStageIndex` | number | |
| `totalStages` | number | 3 |
| `boundTargetGameId` | number \| null | |
| `boundGame` | `GuildChainBoundGameDto \| null` | |
| `activeContractId` | string \| null | |
| `stages` | `GuildChainStageDto[]` | |
| `finalRewards` | `GuildRewardDescriptorDto[]` | |
| `finalBonusSeals` | number | |

### DTO: `GuildChainStageDto`

| Field | Type | Notes |
| --- | --- | --- |
| `index` | number | 0-based |
| `stageKey` | string | Stable localization key |
| `objectiveType` | objective | |
| `targetCount` | number | |
| `criteria` | object | |
| `xpReward` | number | |
| `sealsReward` | number | |
| `durationDays` | number | |
| `usesBoundTargetGame` | boolean | |

### DTO: `GuildChainBoundGameDto`

| Field | Type | Notes |
| --- | --- | --- |
| `gameId` | number | |
| `name` | string | |
| `slug` | string \| null | |
| `coverUrl` | string \| null | |

### DTO: `StartGuildChainDto`

| Field | Type | Notes |
| --- | --- | --- |
| `targetGameId` | number | Optional unless Stage 1 requires a game |

### DTO: `AdvanceGuildChainDto`

| Field | Type | Notes |
| --- | --- | --- |
| `targetGameId` | number | Optional; fills a missing binding only |

### DTO: `GuildChainActionResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chain` | `GuildChainDto` | Fresh chain state |
| `contractId` | string | Created stage contract |

### DTO: `GuildChainClaimProgressDto`

| Field | Type | Notes |
| --- | --- | --- |
| `chainKey` | chain key | |
| `currentStageIndex` | number | |
| `status` | `in_progress \| completed` | |
| `chainCompleted` | boolean | |
| `finalRewards` | `GuildRewardDescriptorDto[]` | Granted on final stage |
| `bonusSealsAwarded` | number | |

### DTO: `GuildBountiesResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `bounties` | `GuildBountyDto[]` | Published, active + 14-day window |

### DTO: `GuildBountyDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `slug` | string | |
| `title` | string | Translated when `locale` matched |
| `description` | string | |
| `objectiveType` | objective | |
| `targetTotal` | number | |
| `currentTotal` | number | |
| `progressPercent` | number | Can exceed 100 |
| `startsAt` | Date | |
| `endsAt` | Date | |
| `status` | `published` | |
| `userContribution` | number | Deduplicated units |
| `minUserContribution` | number | |
| `eligible` | boolean | |
| `claimedMilestones` | number[] | Ascending |
| `milestones` | `GuildBountyMilestoneStateDto[]` | 25/50/100/150 |
| `hasClaimableMilestones` | boolean | |

### DTO: `GuildBountyMilestoneStateDto`

| Field | Type | Notes |
| --- | --- | --- |
| `milestone` | number | |
| `unlocked` | boolean | Shared goal reached it |
| `claimed` | boolean | |
| `claimable` | boolean | Unlocked + eligible + unclaimed |
| `sealsReward` | number | |
| `xpReward` | number | |
| `rewardId` | string \| null | Flat catalog reward |
| `chestKind` | chest tier \| null | |

### DTO: `ClaimGuildBountyResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `bountyId` | string | |
| `claimedMilestones` | number[] | After claim |
| `newlyClaimedMilestones` | number[] | This call |
| `sealsAwarded` | number | Flat + chest |
| `xpAwarded` | number | Guild XP |
| `globalXpAwarded` | number | `floor(xpAwarded × 0.25)` |
| `rankBefore` | rank | |
| `rankAfter` | rank | |
| `unlockedRewards` | `GuildRewardDescriptorDto[]` | |
| `chestResults` | `GuildChestResultDto[]` | |

### DTO: `CreateGuildBountyDto`

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | 1–64, unique |
| `title` | string | 1–120 |
| `description` | string | 1–500 |
| `objectiveType` | objective | All 10 |
| `criteria` | object | Validated per objective |
| `targetTotal` | number | `>= 1` |
| `minUserContribution` | number | Optional, default 1 |
| `maxUserContributionCap` | number | `>= minUserContribution` |
| `milestoneRewards` | object | Keys `25`/`50`/`100`/`150`; missing keys default `{}` |
| `startsAt` | Date | |
| `endsAt` | Date | `> startsAt` |
| `translations` | `GuildBountyTranslationDto[]` | Exactly 2: `en` + `pt-BR` |

### DTO: `UpdateGuildBountyDto`

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | Any subset of create; same validation |
| `title` | string | |
| `description` | string | |
| `objectiveType` | objective | |
| `criteria` | object | |
| `targetTotal` | number | |
| `minUserContribution` | number | |
| `maxUserContributionCap` | number | |
| `milestoneRewards` | object | |
| `startsAt` | Date | |
| `endsAt` | Date | |
| `translations` | `GuildBountyTranslationDto[]` | |

### DTO: `GuildBountyTranslationDto`

| Field | Type | Notes |
| --- | --- | --- |
| `locale` | `en \| pt-BR` | |
| `title` | string | 1–120 |
| `description` | string | 1–500 |

### DTO: `GuildBountyMilestoneRewardDto`

| Field | Type | Notes |
| --- | --- | --- |
| `seals` | number | Optional, `>= 0` |
| `xp` | number | Optional, `>= 0` |
| `rewardId` | string | Optional active reward UUID |
| `chestKind` | chest tier | Optional |

### DTO: `GuildAdminBountyResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `slug` | string | |
| `title` | string | Base copy |
| `description` | string | Base copy |
| `objectiveType` | objective | |
| `criteria` | object | |
| `targetTotal` | number | |
| `currentTotal` | number | |
| `minUserContribution` | number | |
| `maxUserContributionCap` | number | |
| `milestoneRewards` | object | Normalized 25/50/100/150 |
| `startsAt` | Date | |
| `endsAt` | Date | |
| `status` | `draft \| published \| archived` | |
| `publishedAt` | Date \| null | |
| `reached100At` | Date \| null | |
| `translations` | `GuildBountyTranslationDto[]` | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### DTO: `CreateGuildEmporiumItemDto`

| Field | Type | Notes |
| --- | --- | --- |
| `rewardId` | string | Existing reward UUID |
| `priceSeals` | number | `>= 1` |
| `minRank` | rank | Optional, default `E` |
| `isRotating` | boolean | Optional, default false |
| `maxPurchasesPerMonth` | number \| null | Optional, `>= 1` or null |
| `isActive` | boolean | Optional, default true |

### DTO: `UpdateGuildEmporiumItemDto`

| Field | Type | Notes |
| --- | --- | --- |
| `rewardId` | string | Any subset of create |
| `priceSeals` | number | |
| `minRank` | rank | |
| `isRotating` | boolean | |
| `maxPurchasesPerMonth` | number \| null | |
| `isActive` | boolean | |

### DTO: `GuildAdminEmporiumItemResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `reward` | `GuildRewardDescriptorDto` | |
| `priceSeals` | number | |
| `minRank` | rank | |
| `isRotating` | boolean | |
| `maxPurchasesPerMonth` | number \| null | |
| `isActive` | boolean | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### DTO: `CreateGuildEventDto`

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | 1–64, unique |
| `title` | string | 1–120 |
| `description` | string | 1–500 |
| `rank` | rank | |
| `xpReward` | number | `>= 1` |
| `objectiveType` | objective | All 10 |
| `sealsReward` | number | Optional, defaults by rank |
| `bonusObjective` | object | Optional |
| `targetCount` | number | Optional, default 1 |
| `criteria` | object | Validated per objective |
| `rewardId` | string | Optional active reward |
| `startsAt` | Date | |
| `endsAt` | Date | `> startsAt` |
| `translations` | `GuildEventTranslationDto[]` | Omitted preserves; `[]` clears |

### DTO: `UpdateGuildEventDto`

| Field | Type | Notes |
| --- | --- | --- |
| `slug` | string | Any subset of create; same validation |
| `title` | string | |
| `description` | string | |
| `rank` | rank | |
| `xpReward` | number | |
| `objectiveType` | objective | Locked once a contract exists |
| `sealsReward` | number | Locked once a contract exists |
| `bonusObjective` | object | Locked once a contract exists |
| `targetCount` | number | Locked once a contract exists |
| `criteria` | object | Locked once a contract exists |
| `rewardId` | string | Locked once a contract exists |
| `startsAt` | Date | |
| `endsAt` | Date | Moving it re-dates `active` contracts |
| `translations` | `GuildEventTranslationDto[]` | |

### DTO: `GuildAdminEventResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `slug` | string | |
| `title` | string | |
| `description` | string | |
| `rank` | rank | |
| `xpReward` | number | |
| `objectiveType` | objective | |
| `sealsReward` | number | New |
| `targetCount` | number | |
| `criteria` | object | |
| `bonusObjective` | object \| null | New |
| `reward` | `GuildRewardDescriptorDto \| null` | |
| `startsAt` | Date | |
| `endsAt` | Date | |
| `status` | `draft \| published \| archived` | |
| `publishedAt` | Date \| null | |
| `translations` | `GuildEventTranslationDto[]` | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### DTO: `CreateGuildRewardDto`

| Field | Type | Notes |
| --- | --- | --- |
| `key` | string | 1–64, unique |
| `kind` | reward kind | 12 values |
| `achievementId` | string | Required for `badge`; existing definition |
| `inChestPool` | boolean | Only permanent equippable kinds |
| `chestBonusXp` | number | `>= 0` |
| `chestBonusSeals` | number | `>= 0`; new |
| `rarity` | rarity | Optional, default `common` |
| `consumableKey` | consumable | Required for `consumable` |
| `isActive` | boolean | Optional, default true |

### DTO: `UpdateGuildRewardDto`

| Field | Type | Notes |
| --- | --- | --- |
| `key` | string | Any subset; identity locked once referenced |
| `kind` | reward kind | Identity locked once referenced |
| `achievementId` | string | Identity locked once referenced |
| `inChestPool` | boolean | |
| `chestBonusXp` | number | |
| `chestBonusSeals` | number | |
| `rarity` | rarity | |
| `consumableKey` | consumable | |
| `isActive` | boolean | |

### DTO: `GuildAdminRewardResponseDto`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `key` | string | |
| `kind` | reward kind | |
| `achievementId` | string \| null | |
| `inChestPool` | boolean | |
| `chestBonusXp` | number | |
| `chestBonusSeals` | number | New |
| `rarity` | rarity | New |
| `consumableKey` | consumable \| null | New |
| `isActive` | boolean | |
| `createdAt` | Date | |
| `updatedAt` | Date | |

### DTO: `NotificationGuildBountyTargetDto`

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `guild` | |
| `bountyId` | string | Deep-link to the bounty list/claim |

## 6. Notifications

`guild.community-bounty-ready` (version 1, system actor, no `actors`) is committed when a published Community Bounty first reaches 100% (`currentTotal >= targetTotal`). It is addressed at most once per `(bountyId, recipientUserId)` to each eligible contributor, and later overkill contributions never duplicate it.

Inbox item shape (`GET /v1/notifications`):

```json
{
  "type": "guild.community-bounty-ready",
  "actors": [],
  "preview": { "text": "A Community Bounty reached its goal. Claim your reward." },
  "target": { "type": "guild", "bountyId": "3ab3b3f0-1d2b-4a2f-8f2f-58f4d5f6a7b8" },
  "eventCount": 1,
  "actorCount": 0,
  "lastEventAt": "2026-11-21T12:00:00.000Z",
  "version": 1,
  "readVersion": 0
}
```

- `subjectType` is `guild_community_bounty`; `rootType`/`rootId` are `guild`/`bountyId`.
- The existing `guild.contract-ready` and `guild.contract-expiring` notifications are unchanged; their target remains `{ type: "guild", contractId }`.
- Deep-link to `GET /v1/guild/bounties` (there is no single-bounty player GET); open the row whose `id` matches `bountyId` and call claim when `hasClaimableMilestones` is true.

## 7. Admin endpoints

All routes require `ADMIN` or `EDITOR` (401 unauthenticated, 403 other roles) and are not affected by `GUILD_ACCESS_MODE`.

### 7.1 Events (`/v1/guild/admin/events`)

Existing behavior is preserved, with these additions:

- All 10 objectives and extended criteria are accepted; `sealsReward` defaults to the rank economy value; optional `bonusObjective` is validated with `validateGuildBonusObjective`.
- Invalid rules → `400 { message: "Invalid quest rules.", errors: string[] }`.
- Once any contract exists for the event, changing `objectiveType`, `criteria`, `targetCount`, `xpReward`, `sealsReward`, `bonusObjective` or `rewardId` → `409 code: "guild_event_rules_locked"`.
- Changing `endsAt` also moves `expiresAt` on the event's `active` contracts; `ready_to_claim`/terminal contracts keep theirs.
- Publish still requires `endsAt > now` and a published badge achievement; archived events cannot be published (`409`, message only).
- `GET .../events` returns `GuildAdminEventResponseDto[]` ordered by `createdAt` DESC; create/publish/archive return `201`.

### 7.2 Rewards (`/v1/guild/admin/rewards`)

`CreateGuildRewardDto`/`UpdateGuildRewardDto` support all 12 kinds, `rarity`, `chestBonusSeals` and `consumableKey`.

- `inChestPool: true` is valid only for `title`, `avatar_frame`, `license_theme`, `stamp_style`, `tavern_decor`; anything else → `400`.
- `kind: "consumable"` requires `consumableKey`; `kind: "badge"` requires an existing `achievementId` → `400` otherwise.
- Changing `key`, `kind` or `achievementId` once the reward is referenced by a contract/unlock → `409 code: "guild_reward_identity_locked"`; `isActive`, `inChestPool`, `chestBonusXp`, `chestBonusSeals`, `rarity` stay editable.
- Duplicate key → `409` (message only). Unknown id → `404`. No delete endpoint.

### 7.3 Emporium (`/v1/guild/admin/emporium`)

- `GET` → `GuildAdminEmporiumItemResponseDto[]` (all listings, `createdAt` DESC).
- `POST` (201) / `PATCH` (200): `rewardId` must exist and be grantable (consumable reward needs `consumableKey`, badge reward needs `achievementId`); `priceSeals >= 1`; `maxPurchasesPerMonth` is null or `>= 1`; `minRank` defaults to `E`; `isRotating`/`isActive` default to `false`/`true`. Invalid → `400`; unknown id → `404`.
- Updates lock the listing so a purchase cannot land mid-edit. Rotating listings become eligible for the monthly deterministic showcase; a rotating listing that is not in the current showcase cannot be purchased.

### 7.4 Community Bounties (`/v1/guild/admin/bounties`)

- `GET` → all statuses, `createdAt` DESC array; `GET /:id` → one.
- `POST` (201) / `PATCH` (200): unique `slug`, both `en` and `pt-BR` translations (exactly 2, no duplicate locales), validated objective/criteria (`targetTotal` replaces `targetCount` in the shared rule validator), `maxUserContributionCap >= minUserContribution`, `endsAt > startsAt`, and normalized `milestoneRewards` keyed `25`/`50`/`100`/`150` (missing → `{}`; `rewardId` must be an active Guild reward; `chestKind` one of the 4 tiers).
- Rules lock (`409 code: "guild_bounty_rules_locked"`) once `currentTotal > 0` or any contribution row exists, for `objectiveType`, `criteria`, `targetTotal`, `minUserContribution`, `maxUserContributionCap`, `milestoneRewards`, `startsAt`. `slug`, `title`, `description`, `endsAt` and `translations` stay editable.
- `POST /:id/publish` (201): sets `publishedAt` on first publish, requires `endsAt > now`, archived → `409` (message only). `POST /:id/archive` (201): hides it from players; existing contributions/claims remain.
- Unknown id → `404`; duplicate slug → `409` (message only).

## 8. Localization tables (`en` / `pt-BR`)

The server does **not** localize this copy; clients render it from stable keys. Always use API numbers/ranks/objectives for logic; these tables are for rendering.

### 8.1 System quest templates (`templateKey`, 31)

The 24 weekly-pool templates (`cycle: "weekly"`) plus the 7 Monthly Expeditions (`cycle: "monthly"`), exactly as defined in `src/guild/guild-templates.constants.ts`.

| `templateKey` | Category | Rank | Min rank | XP | Seals | Objective | Target | Duration (d) | Reward key | `en` title — description | `pt-BR` title — description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `recent_dust` | `library` | `C` | `E` | 260 | 35 | `finish_game` | 1 | 21 | `chest_silver` | Recent Dust — Finish a backlog game left untouched for 90+ days. | Poeira Recente — Finalize um jogo do backlog parado há mais de 90 dias. |
| `forgotten_relic` | `library` | `B` | `E` | 420 | 60 | `finish_game` | 1 | 21 | `badge_archaeologist` | Forgotten Relic — Finish a game that has been waiting in your backlog for over a year. | Relíquia Esquecida — Finalize um jogo esquecido no seu backlog há mais de um ano. |
| `deep_dive` | `library` | `C` | `E` | 240 | 35 | `finish_game` | 1 | 21 | `chest_silver` | Deep Dive — Finish a game you are currently playing. | Mergulho Profundo — Finalize um jogo que você está jogando. |
| `off_the_map` | `library` | `B` | `D` | 400 | 60 | `finish_game` | 1 | 21 | `chest_silver` | Off the Map — Finish a backlog game from a genre you rarely play. | Fora do Mapa — Finalize um jogo de um gênero que você quase não joga. |
| `continue_the_saga` | `library` | `C` | `D` | 300 | 40 | `finish_game` | 1 | 21 | `chest_silver` | Continue the Saga — Finish another game from a franchise you already started. | Continue a Saga — Finalize outro jogo de uma franquia que você já começou. |
| `time_machine` | `library` | `C` | `E` | 280 | 35 | `finish_game` | 1 | 21 | `chest_silver` | Time Machine — Finish an unfinished game from a past decade. | Máquina do Tempo — Finalize um jogo inacabado de uma década passada. |
| `return_to_the_world` | `library` | `C` | `D` | 270 | 35 | `finish_game` | 1 | 21 | `chest_silver` | Return to the World — Finish a DLC, expansion or remake of a game you completed. | Volte ao Mundo — Finalize uma DLC, expansão ou remake de um jogo que você concluiu. |
| `hidden_gem` | `library` | `C` | `D` | 290 | 40 | `finish_game` | 1 | 21 | `chest_silver` | Hidden Gem — Finish a little-played indie gem from your backlog. | Joia Escondida — Finalize um indie pouco jogado do seu backlog. |
| `short_caravan` | `weekly` | `D` | `E` | 170 | 20 | `finish_game` | 1 | 7 | `chest_bronze` | Short Caravan — Finish a game that takes 8 hours or less. | Caravana Curta — Finalize um jogo de até 8 horas. |
| `weekend_sprint` | `weekly` | `D` | `E` | 160 | 20 | `finish_game` | 1 | 7 | `chest_bronze` | Weekend Sprint — Finish any game from your library this week. | Corrida de Fim de Semana — Finalize qualquer jogo da sua biblioteca nesta semana. |
| `double_feature` | `weekly` | `C` | `D` | 310 | 40 | `finish_game` | 2 | 7 | `chest_silver` | Double Feature — Finish 2 games from your library this week. | Sessão Dupla — Finalize 2 jogos da sua biblioteca nesta semana. |
| `field_vigil` | `weekly` | `D` | `E` | 140 | 20 | `log_playtime` | 240 | 7 | `chest_bronze` | Field Vigil — Log 4 hours of playtime this week. | Vigília de Campo — Registre 4 horas de jogo nesta semana. |
| `backlog_taste_test` | `weekly` | `D` | `E` | 150 | 20 | `log_playtime` | 2 | 7 | `chest_bronze` | Backlog Taste Test — Play 45 minutes of two planned backlog games. | Teste de Sabor do Backlog — Jogue 45 minutos de dois jogos planejados. |
| `campaign_rhythm` | `weekly` | `D` | `E` | 150 | 20 | `play_distinct_days` | 4 | 7 | `chest_bronze` | Campaign Rhythm — Play at least 15 minutes on 4 different days. | Ritmo de Campanha — Jogue pelo menos 15 minutos em 4 dias diferentes. |
| `trophy_hunter` | `weekly` | `C` | `D` | 230 | 35 | `earn_game_achievements` | 10 | 7 | `chest_silver` | Trophy Hunter — Earn 10 synced platform achievements. | Caçador de Troféus — Conquiste 10 conquistas sincronizadas. |
| `captains_log` | `gamenode` | `E` | `E` | 90 | 15 | `write_review` | 1 | 7 | `title_chronist` | Captain's Log — Write a review for a game you finished this month. | Diário de Bordo — Escreva uma review de um jogo que você finalizou neste mês. |
| `quick_take` | `gamenode` | `E` | `E` | 70 | 10 | `write_review` | 1 | 7 | `null` | Quick Take — Write a review for any game. | Crítica Rápida — Escreva uma review de qualquer jogo. |
| `on_duty_critic` | `gamenode` | `D` | `E` | 150 | 20 | `write_review` | 3 | 7 | `chest_bronze` | On-Duty Critic — Write 3 reviews of 80+ characters this week. | Crítico de Plantão — Escreva 3 reviews de 80+ caracteres esta semana. |
| `deep_critic` | `gamenode` | `C` | `D` | 220 | 35 | `write_review` | 2 | 7 | `chest_silver` | Deep Critic — Write 2 reviews of 200+ characters. | Crítico Profundo — Escreva 2 reviews com 200+ caracteres. |
| `guild_oracle` | `gamenode` | `E` | `E` | 90 | 15 | `daily_challenge` | 3 | 7 | `chest_bronze` | Guild Oracle — Win 3 GameNode Daily puzzles. | Oráculo da Guilda — Vença 3 desafios do GameNode Daily. |
| `eagle_eye` | `gamenode` | `C` | `D` | 230 | 35 | `daily_challenge` | 2 | 7 | `chest_silver` | Eagle Eye — Win 2 Daily puzzles without hints in 3 attempts or fewer. | Olho de Águia — Vença 2 desafios do Daily sem dicas e com no máximo 3 tentativas. |
| `cartographer` | `gamenode` | `E` | `E` | 85 | 15 | `curate_collection` | 1 | 7 | `chest_bronze` | Cartographer — Publish a public collection with 5+ games and a description. | Cartógrafo — Publique uma coleção pública com 5+ jogos e uma descrição. |
| `expedition_log` | `gamenode` | `E` | `E` | 75 | 10 | `publish_post` | 1 | 7 | `null` | Expedition Log — Publish a post of 80+ characters about a game. | Registro de Expedição — Publique um post de 80+ caracteres sobre um jogo. |
| `pack_cleanup` | `gamenode` | `E` | `E` | 80 | 15 | `triage_backlog` | 3 | 7 | `chest_bronze` | Pack Cleanup — Triage 3 games stuck in your backlog for 30+ days. | Arrumando a Mochila — Faça a triagem de 3 jogos parados no backlog há 30+ dias. |
| `the_colossus` | `monthly` | `A` | `C` | 750 | 110 | `finish_game` | 1 | 45 | `chest_gold` | The Colossus — Finish a 35+ hour epic. | O Colosso — Finalize uma epopeia de 35+ horas. |
| `ancient_fossil` | `monthly` | `A` | `C` | 720 | 110 | `finish_game` | 1 | 45 | `chest_gold` | Ancient Fossil — Finish a game untouched for 3+ years. | Fóssil Ancestral — Finalize um jogo intocado há 3+ anos. |
| `genre_marathon` | `monthly` | `A` | `C` | 780 | 120 | `finish_game` | 3 | 30 | `chest_gold` | Genre Marathon — Finish 3 games from the same genre. | Maratona de Gênero — Finalize 3 jogos do mesmo gênero. |
| `deep_critic_anthology` | `monthly` | `A` | `C` | 650 | 100 | `write_review` | 5 | 30 | `chest_gold` | Deep Critic Anthology — Write 5 reviews of 250+ characters. | Antologia do Crítico — Escreva 5 reviews com 250+ caracteres. |
| `platinum_crown` | `monthly` | `S` | `A` | 1350 | 200 | `complete_game_100` | 1 | 60 | `chest_relic` | Platinum Crown — Earn 100% achievements on a game with 5+ achievements. | Coroa de Platina — Conquiste 100% das conquistas de um jogo com 5+ conquistas. |
| `colossus_legend` | `monthly` | `S` | `A` | 1400 | 200 | `finish_game` | 1 | 60 | `chest_relic` | Colossus Legend — Finish a 60+ hour legend. | Lenda Colossal — Finalize uma lenda de 60+ horas. |
| `saga_trilogy` | `monthly` | `S` | `A` | 1300 | 200 | `finish_game` | 3 | 60 | `chest_relic` | Saga Trilogy — Finish 3 games from the same franchise or theme. | Trilogia da Saga — Finalize 3 jogos da mesma franquia ou tema. |

Notes:

- `double_feature`, `genre_marathon` and `saga_trilogy` have `targetCount: 2/3/3` and never accept a `targetGameId`.
- Review quests count reviews of 80+ **plain-text** characters unless `criteria.minReviewChars` is higher (`deep_critic` 200, `deep_critic_anthology` 250, chain stages 80/150).
- `platinum_crown` and `trophy_hunter` are only offered to users with synced external achievements.
- `quick_take` and `expedition_log` have `reward: null` (pure XP + Seals).

### 8.2 Quest chains (`chainKey`, 3 chains / 9 stages)

`titleKey` comes from the API (`GuildChainDto.titleKey`); stage copy is keyed by `stageKey`.

| `chainKey` | `titleKey` | Min rank | Final bonus Seals | `en` title — description | `pt-BR` title — description |
| --- | --- | --- | --- | --- | --- |
| `pathfinders_arc` | `guild_chain_pathfinders_arc_title` | `E` | 100 | Pathfinder's Arc — Chart a trail from first steps to a written field report. | O Arco do Desbravador — Trace uma trilha dos primeiros passos até um relatório de campo. |
| `curators_arc` | `guild_chain_curators_arc_title` | `D` | 120 | Curator's Arc — Build an exhibit, complete it, and write its story. | O Arco do Curador — Monte uma exposição, conclua-a e escreva sua história. |
| `relic_hunters_arc` | `guild_chain_relic_hunters_arc_title` | `C` | 200 | Relic Hunter's Arc — Clean the vault, recover a relic, and chronicle it. | O Arco do Caçador de Relíquias — Limpe o cofre, recupere uma relíquia e registre sua história. |

| `chainKey` | `stageKey` | Objective | Target | XP | Seals | Duration (d) | Bound game | `en` title — objective | `pt-BR` title — objective |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pathfinders_arc` | `trail_head` | `log_playtime` | 120 | 100 | 15 | 21 | yes | Trail Head — Play 2 hours of the chosen game. | Início da Trilha — Jogue 2 horas do jogo escolhido. |
| `pathfinders_arc` | `summit_push` | `finish_game` | 1 | 180 | 25 | 21 | yes | Summit Push — Finish the chosen game. | Rumo ao Cume — Finalize o jogo escolhido. |
| `pathfinders_arc` | `field_notes` | `write_review` | 1 | 260 | 35 | 21 | yes | Field Notes — Write a review of 80+ characters for the chosen game. | Notas de Campo — Escreva uma review de 80+ caracteres para o jogo escolhido. |
| `curators_arc` | `first_exhibit` | `curate_collection` | 1 | 120 | 20 | 14 | no | First Exhibit — Publish a collection with 5+ games and a 20+ character description. | Primeira Exposição — Publique uma coleção com 5+ jogos e descrição de 20+ caracteres. |
| `curators_arc` | `curated_finish` | `finish_game` | 1 | 200 | 30 | 21 | no | Curated Finish — Finish a game from your library. | Conclusão Curada — Finalize um jogo da sua biblioteca. |
| `curators_arc` | `curators_essay` | `publish_post` | 1 | 260 | 40 | 14 | no | Curator's Essay — Publish a 200+ character post about a game. | Ensaio do Curador — Publique um post de 200+ caracteres sobre um jogo. |
| `relic_hunters_arc` | `relic_triage` | `triage_backlog` | 3 | 160 | 25 | 14 | no | Relic Triage — Triage 3 games stuck in your backlog. | Triagem de Relíquias — Faça a triagem de 3 jogos parados no backlog. |
| `relic_hunters_arc` | `relic_finish` | `finish_game` | 1 | 280 | 45 | 30 | no | Relic Recovery — Finish a game from your backlog. | Recuperação da Relíquia — Finalize um jogo do seu backlog. |
| `relic_hunters_arc` | `relic_chronicle` | `write_review` | 2 | 340 | 60 | 21 | no | Relic Chronicle — Write 2 reviews of 150+ characters. | Crônica da Relíquia — Escreva 2 reviews com 150+ caracteres. |

Final-stage claim also grants the chain's exclusive cosmetics and Seals (section 8.7), and emits `lina.trigger = "chain_completed"`.

### 8.3 Lina triggers and poses

| `trigger` | Pose | `en` copy | `pt-BR` copy |
| --- | --- | --- | --- |
| `contract_accepted` | `happy` | Quest accepted! Your contract is stamped and ready to complete. | Pedido aceito! Seu contrato está carimbado e pronto para concluir. |
| `contract_claimed` | `happy` | Contract delivered! Here is your reward. | Contrato entregue! Aqui está a sua recompensa. |
| `contract_ready_to_claim` | `happy` | Your contract is ready to turn in! | Seu contrato está pronto para entregar! |
| `returning_after_inactivity` | `neutral` | Welcome back! It's been a while. | Bem-vindo de volta! Faz tempo. |
| `weekly_board_refreshed` | `neutral` | A new board is waiting for you. | Um novo quadro espera por você. |
| `stale_backlog_game` | `neutral` | This one has been waiting a long time… | Esse aqui espera há muito tempo… |
| `rank_promoted` | `happy` | A new rank! Your Guild License bears a new seal. | Novo posto! Sua Licença da Guilda carrega um novo selo. |
| `chain_completed` | `happy` | The arc is complete! Lina keeps the final relic safe for you. | O arco está completo! Lina guarda a relíquia final para você. |
| `community_bounty_ready` | `happy` | The whole Guild pitched in — the Community Bounty is ready to claim! | A Guilda inteira ajudou — a Recompensa Comunitária está pronta para resgatar! |
| `monthly_expedition_refreshed` | `neutral` | A new Monthly Expedition is pinned to your board. | Uma nova Expedição Mensal está fixada no seu quadro. |
| `default` | `neutral` | Welcome to the Adventurers Guild. | Bem-vindo à Guilda dos Aventureiros. |

Poses: `happy` = celebratory (raised mug / sparkle), `neutral` = calm greeting. Animate by `trigger` + `pose`; unknown triggers fall back to `default`/`neutral`.

### 8.4 Ranks, perks and Prestige `S+`

| Rank | `en` title | `pt-BR` title | Max active contracts | Weekly rerolls | Monthly Expedition | Rank S expeditions | Free Hourglass / month | Legendary flag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `E` | Novice | Novato | 3 | 0 | no | no | 0 | no |
| `D` | Apprentice | Aprendiz | 3 | 1 | no | no | 0 | no |
| `C` | Adventurer | Aventureiro | 3 | 1 | yes | no | 0 | no |
| `B` | Veteran | Veterano | 4 | 1 | yes | no | 0 | no |
| `A` | Elite | Elite | 4 | 1 | yes | yes | 1 | no |
| `S` | Legend | Lenda | 4 | 2 | yes | yes | 1 | yes |

Rank thresholds: `E 0`, `D 300`, `C 800`, `B 2,000`, `A 4,000`, `S 7,500` XP (use `currentRankMinXp`/`nextRankXp` instead of hard-coding).

Promotion packages (granted once, in order, on crossing the rank; multi-rank jumps grant every crossed package):

| Rank | `en` package label | `pt-BR` package label | Reward keys |
| --- | --- | --- | --- |
| `D` | Initiate's Kit | Kit do Iniciado | `title_guild_initiate`, `frame_copper_compass` |
| `C` | Scout's Kit | Kit do Batedor | `title_field_scout`, `decor_tavern_lantern` |
| `B` | Veteran's Kit | Kit do Veterano | `frame_forged_steel`, `decor_sleeping_cat` |
| `A` | Master's Kit | Kit do Mestre | `title_master_adventurer`, `license_gilded_ledger` |
| `S` | Legend's Kit | Kit da Lenda | `frame_astral_crown`, `title_guild_legend` |

**Prestige `S+`**: once at 7,500 XP, every additional 2,500 Guild XP grants one Prestige star. `prestigeLevel = floor(max(0, xp − 7500) / 2500)`; `prestigeXpIntoCurrent` and `xpToNextPrestige` come from the API. Each new star opens one `chest_relic` and credits its Seals inside the claim transaction; the chest's XP does **not** advance the next star. Render `S+` as rank `S` plus `prestigeLevel` stars; `en`: "Prestige {n}", `pt-BR`: "Prestígio {n}".

### 8.5 Consumables

| Key | `en` name — effect | `pt-BR` name — effect |
| --- | --- | --- |
| `hourglass` | Hourglass — Extend one active contract by 7 days (once per contract). | Ampulheta — Estende um contrato ativo em 7 dias (uma vez por contrato). |
| `reroll_charter` | Reroll Charter — Reroll one open weekly board quest when free rerolls are exhausted. | Carta de Renovação — Renova uma missão semanal aberta quando as renovações grátis acabaram. |
| `extra_slot_permit` | Extra Slot Permit — +1 active contract slot until the next Monday. | Licença de Vaga Extra — +1 vaga de contrato ativo até a próxima segunda-feira. |

The Rank `A`/`S` free monthly Hourglass is not an inventory item: it is consumed first by `POST /v1/guild/contracts/{id}/extend` and reflected in `usedFreeMonthlyHourglass`.

### 8.6 Chest tiers

| Key | `en` name | `pt-BR` name | Bonus XP | Bonus Seals | Pool rarity (fallback) | Consumable drop | Exhausted bonus |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `chest_bronze` | Bronze Chest | Baú de Bronze | 40 | 15 | `common` | — | +50 XP, +25 Seals |
| `chest_silver` | Silver Chest | Baú de Prata | 75 | 30 | `uncommon` (`common`) | — | +50 XP, +45 Seals |
| `chest_gold` | Gold Chest | Baú de Ouro | 125 | 60 | `rare` (`uncommon`) | 35%: `hourglass` or `reroll_charter` | +50 XP, +80 Seals |
| `chest_relic` | Relic Chest | Baú de Relíquias | 200 | 120 | `legendary`/`epic` (`rare`) | Guaranteed: `hourglass`, `reroll_charter` or `extra_slot_permit` | +50 XP, +150 Seals |
| `weekly_chest` | Weekly Chest (legacy Silver) | Baú Semanal (Prata legado) | 75 | 30 | Same as `chest_silver` | — | Same as Silver |

Upgrade ladder: `chest_bronze` → `chest_silver` → `chest_gold` → `chest_relic`; a satisfied bonus objective with `upgradeChestTier: true` upgrades one step (`weekly_chest` starts at Silver). An exhausted pool means every active cosmetic in the pool/fallback rarities is owned; the cosmetic slot then converts to the exhausted bonus and `unlockedCosmetic` is `null`.

### 8.7 Seeded cosmetic and reward keys (78)

Every key below exists in `guild_reward` after the migration chain. `Source` is for client grouping/art planning only. The ten legacy pool keys (`title_backlog_slayer`, `title_guild_veteran`, `frame_parchment_seal`, `frame_lantern_glow`, `title_relic_hunter`, `title_night_owl`, `title_completionist`, `frame_ember_rune`, `frame_moonlit_ivy`, `frame_gilded_compass`) are already in the client's existing catalog.

| Key | Kind | Rarity | Source | `en` name | `pt-BR` name |
| --- | --- | --- | --- | --- | --- |
| `badge_archaeologist` | `badge` | `common` | Starter badge (`guild-archaeologist`) | Archaeologist | Arqueólogo |
| `title_chronist` | `title` | `common` | Starter / `captains_log` | Chronicler | Cronista |
| `title_backlog_slayer` | `title` | `common` | Legacy chest pool | Backlog Slayer | Caçador de Backlog |
| `title_guild_veteran` | `title` | `common` | Legacy chest pool | Guild Veteran | Veterano da Guilda |
| `title_relic_hunter` | `title` | `common` | Legacy chest pool | Relic Hunter | Caçador de Relíquias |
| `title_night_owl` | `title` | `common` | Legacy chest pool | Night Owl | Coruja Noturna |
| `title_completionist` | `title` | `common` | Legacy chest pool | Completionist | Completista |
| `title_tavern_regular` | `title` | `common` | Common chest pool | Tavern Regular | Freguês da Taverna |
| `title_weekend_warrior` | `title` | `common` | Common chest pool | Weekend Warrior | Guerreiro de Fim de Semana |
| `title_pixel_pilgrim` | `title` | `common` | Common chest pool | Pixel Pilgrim | Peregrino de Pixels |
| `title_guild_initiate` | `title` | `uncommon` | Rank `D` package | Guild Initiate | Iniciado da Guilda |
| `title_field_scout` | `title` | `uncommon` | Rank `C` package | Field Scout | Batedor de Campo |
| `title_swift_scholar` | `title` | `uncommon` | Uncommon chest pool | Swift Scholar | Erudito Veloz |
| `title_dungeon_cartographer` | `title` | `uncommon` | Uncommon chest pool | Dungeon Cartographer | Cartógrafo de Masmorras |
| `title_seasonal_explorer` | `title` | `uncommon` | Rotating Emporium | Seasonal Explorer | Explorador Sazonal |
| `title_arcane_archivist` | `title` | `rare` | Rare chest pool | Arcane Archivist | Arquivista Arcano |
| `title_pathfinder` | `title` | `rare` | `pathfinders_arc` final | Pathfinder | Desbravador |
| `title_master_adventurer` | `title` | `epic` | Rank `A` package | Master Adventurer | Mestre Aventureiro |
| `title_curator_prime` | `title` | `epic` | `curators_arc` final | Curator Prime | Curador-Mor |
| `title_realm_warden` | `title` | `epic` | Epic chest pool | Realm Warden | Guardião do Reino |
| `title_guild_legend` | `title` | `legendary` | Rank `S` package | Guild Legend | Lenda da Guilda |
| `title_relic_warden` | `title` | `legendary` | `relic_hunters_arc` final | Relic Warden | Guardião das Relíquias |
| `title_lina_chosen` | `title` | `legendary` | Legendary chest pool | Lina's Chosen | Escolhido de Lina |
| `frame_parchment_seal` | `avatar_frame` | `common` | Legacy chest pool | Parchment Seal | Selo de Pergaminho |
| `frame_lantern_glow` | `avatar_frame` | `common` | Legacy chest pool | Lantern Glow | Brilho de Lanterna |
| `frame_ember_rune` | `avatar_frame` | `common` | Legacy chest pool | Ember Rune | Runa de Brasa |
| `frame_moonlit_ivy` | `avatar_frame` | `common` | Legacy chest pool | Moonlit Ivy | Hera Enluarada |
| `frame_gilded_compass` | `avatar_frame` | `common` | Legacy chest pool | Gilded Compass | Bússola Dourada |
| `frame_wooden_badge` | `avatar_frame` | `common` | Common chest pool | Wooden Badge | Distintivo de Madeira |
| `frame_candle_glow` | `avatar_frame` | `common` | Common chest pool | Candle Glow | Brilho de Vela |
| `frame_copper_compass` | `avatar_frame` | `uncommon` | Rank `D` package | Copper Compass | Bússola de Cobre |
| `frame_silver_laurel` | `avatar_frame` | `uncommon` | Uncommon chest pool | Silver Laurel | Louro de Prata |
| `frame_owl_wing` | `avatar_frame` | `uncommon` | Uncommon chest pool | Owl Wing | Asa de Coruja |
| `frame_ruby_sigil` | `avatar_frame` | `rare` | Rare chest pool | Ruby Sigil | Sigilo de Rubi |
| `frame_forged_steel` | `avatar_frame` | `epic` | Rank `B` package | Forged Steel | Aço Forjado |
| `frame_dragonbone` | `avatar_frame` | `epic` | Epic chest pool | Dragonbone | Osso de Dragão |
| `frame_harvest_crown` | `avatar_frame` | `epic` | Rotating Emporium | Harvest Crown | Coroa da Colheita |
| `frame_astral_crown` | `avatar_frame` | `legendary` | Rank `S` package | Astral Crown | Coroa Astral |
| `frame_celestial_compass` | `avatar_frame` | `legendary` | Legendary chest pool | Celestial Compass | Bússola Celestial |
| `license_travelers_ledger` | `license_theme` | `common` | Common chest pool | Traveler's Ledger | Registro do Viajante |
| `license_mapmakers_ledger` | `license_theme` | `uncommon` | Uncommon chest pool | Mapmaker's Ledger | Registro do Cartógrafo |
| `license_royal_archive` | `license_theme` | `rare` | Rare chest pool | Royal Archive | Arquivo Real |
| `license_tavern_ledger` | `license_theme` | `rare` | Permanent Emporium | Tavern Ledger | Registro da Taverna |
| `license_autumn_ledger` | `license_theme` | `rare` | Rotating Emporium | Autumn Ledger | Registro de Outono |
| `license_obsidian_ledger` | `license_theme` | `epic` | Permanent Emporium | Obsidian Ledger | Registro de Obsidiana |
| `license_winter_ledger` | `license_theme` | `epic` | Rotating Emporium | Winter Ledger | Registro de Inverno |
| `license_gilded_ledger` | `license_theme` | `legendary` | Rank `A` package | Gilded Ledger | Registro Dourado |
| `stamp_inkwell` | `stamp_style` | `common` | Common chest pool | Inkwell Stamp | Carimbo de Tinteiro |
| `stamp_silver_quill` | `stamp_style` | `uncommon` | Uncommon chest pool | Silver Quill | Pena de Prata |
| `stamp_pumpkin_wax` | `stamp_style` | `uncommon` | Rotating Emporium | Pumpkin Wax | Cera de Abóbora |
| `stamp_ember_wax` | `stamp_style` | `rare` | Rare chest pool | Ember Wax | Cera de Brasa |
| `stamp_royal_wax` | `stamp_style` | `rare` | Permanent Emporium | Royal Wax | Cera Real |
| `stamp_frost_seal` | `stamp_style` | `rare` | Rotating Emporium | Frost Seal | Selo de Gelo |
| `stamp_gold_seal` | `stamp_style` | `epic` | Permanent Emporium | Gold Seal | Selo Dourado |
| `stamp_obsidian_seal` | `stamp_style` | `epic` | Epic chest pool | Obsidian Seal | Selo de Obsidiana |
| `decor_mug_of_ale` | `tavern_decor` | `common` | Common chest pool | Mug of Ale | Caneca de Cerveja |
| `decor_brass_astrolabe` | `tavern_decor` | `uncommon` | Uncommon chest pool | Brass Astrolabe | Astrolábio de Latão |
| `decor_herb_planter` | `tavern_decor` | `uncommon` | Uncommon chest pool | Herb Planter | Vaso de Ervas |
| `decor_oak_barrel` | `tavern_decor` | `uncommon` | Permanent Emporium | Oak Barrel | Barril de Carvalho |
| `decor_crystal_chandelier` | `tavern_decor` | `rare` | Rare chest pool | Crystal Chandelier | Lustre de Cristal |
| `decor_ancient_globe` | `tavern_decor` | `rare` | Rare chest pool | Ancient Globe | Globo Antigo |
| `decor_tavern_lantern` | `tavern_decor` | `rare` | Rank `C` package | Tavern Lantern | Lanterna da Taverna |
| `decor_curators_shelf` | `tavern_decor` | `rare` | `curators_arc` final | Curator's Shelf | Estante do Curador |
| `decor_snowglobe` | `tavern_decor` | `rare` | Rotating Emporium | Snowglobe | Globo de Neve |
| `decor_sleeping_cat` | `tavern_decor` | `epic` | Rank `B` package | Sleeping Cat | Gato Dormindo |
| `decor_autumn_wreath` | `tavern_decor` | `epic` | Rotating Emporium | Autumn Wreath | Coroa de Outono |
| `decor_compass_rose` | `tavern_decor` | `epic` | `pathfinders_arc` final | Compass Rose | Rosa dos Ventos |
| `decor_enchanted_tapestry` | `tavern_decor` | `epic` | Epic chest pool | Enchanted Tapestry | Tapeçaria Encantada |
| `decor_golden_griffin` | `tavern_decor` | `legendary` | Legendary chest pool | Golden Griffin | Grifo Dourado |
| `decor_relic_plinth` | `tavern_decor` | `legendary` | `relic_hunters_arc` final | Relic Plinth | Pedestal de Relíquias |
| `hourglass` | `consumable` | `rare` | Emporium / Gold / Relic / Passport 6 | Hourglass | Ampulheta |
| `reroll_charter` | `consumable` | `uncommon` | Emporium / Gold / Relic | Reroll Charter | Carta de Renovação |
| `extra_slot_permit` | `consumable` | `epic` | Emporium / Relic | Extra Slot Permit | Licença de Vaga Extra |
| `chest_bronze` | `chest_bronze` | `common` | Seeded tier | Bronze Chest | Baú de Bronze |
| `chest_silver` | `chest_silver` | `uncommon` | Seeded tier | Silver Chest | Baú de Prata |
| `chest_gold` | `chest_gold` | `rare` | Seeded tier | Gold Chest | Baú de Ouro |
| `chest_relic` | `chest_relic` | `legendary` | Seeded tier | Relic Chest | Baú de Relíquias |
| `weekly_chest` | `weekly_chest` | `uncommon` | Legacy starter tier | Weekly Chest | Baú Semanal |

Guild Seals: `en` "Guild Seals", `pt-BR` "Selos da Guilda". The Emporium is "Lina's Emporium" / "Empório da Lina"; the Passport is "Monthly Guild Passport" / "Passaporte Mensal da Guilda".

### 8.8 Seeded Emporium listings (16)

| Listing id | Reward key | Price (Seals) | Min rank | Rotating | Max / month |
| --- | --- | --- | --- | --- | --- |
| `f2af7e19-b835-4311-89de-88148b57c07d` | `license_obsidian_ledger` | 120 | `C` | no | — |
| `29419e53-57f0-4a56-a104-d93cf7b52005` | `license_tavern_ledger` | 140 | `B` | no | — |
| `d51f3a74-c2f1-48e0-bf87-23804062f552` | `stamp_gold_seal` | 90 | `D` | no | — |
| `e3ed7083-ce0b-48a1-86a9-929d0bd29d96` | `stamp_royal_wax` | 70 | `C` | no | — |
| `e958a693-1ec0-4148-8478-cd8d93837fce` | `decor_oak_barrel` | 100 | `D` | no | — |
| `556f387f-728f-4c45-a54a-7e5003855e1a` | `hourglass` | 60 | `E` | no | 5 |
| `6fe3d186-6c0b-42f3-835a-1e42e54aa943` | `reroll_charter` | 45 | `E` | no | 5 |
| `4319f339-88bb-4ac8-b06c-2e78b18ba6c9` | `extra_slot_permit` | 80 | `E` | no | 3 |
| `eabc7cef-ad53-495d-a9a3-ff3b86cd4988` | `license_autumn_ledger` | 150 | `C` | yes | — |
| `db4d18ca-084b-4b44-8064-ea6cfc1af4ac` | `stamp_pumpkin_wax` | 80 | `D` | yes | — |
| `058e60eb-e0e7-4c61-bc0f-2b4fc00ac8fb` | `decor_autumn_wreath` | 110 | `D` | yes | — |
| `72cf7a96-0096-4584-80bf-40f4bd578276` | `frame_harvest_crown` | 160 | `B` | yes | — |
| `773aa82c-85d4-46a2-be94-ea9ce896b4f7` | `title_seasonal_explorer` | 130 | `D` | yes | — |
| `0d64fa45-e7d3-4d6a-80a8-e577da294728` | `decor_snowglobe` | 120 | `D` | yes | — |
| `67eec4fb-8915-4eb3-b61c-69a96770deff` | `license_winter_ledger` | 150 | `C` | yes | — |
| `8b7d517e-fd2a-470a-8b78-2e7342ec7dbf` | `stamp_frost_seal` | 80 | `D` | yes | — |

The 8 rotating listings guarantee the 6-item showcase always fills.

## 9. Error codes

Business errors carry `code` next to `message`. Validation errors are standard Nest `400` responses (`message` may be a string or an array); generic `404`s and some `409`s have no `code` (documented as "message only").

| HTTP | `code` | Where | Client handling |
| --- | --- | --- | --- |
| 400 | — | invalid body/query, invalid target game/criteria/dates/translations, too many decor/showcase keys | Show the field/message; don't retry unchanged |
| 400 | `guild_cosmetic_limit_exceeded` | `PATCH /v1/guild/cosmetics` (server-side distinct/limit check) | Enforce the 4-decor / 3-badge caps |
| 400 | `guild_passport_invalid_milestone` | passport claim | Only 2/4/6 are valid |
| 401 | — | missing/invalid session | Sign-in |
| 403 | `guild_early_access_required` | player Guild routes under `supporters` | Early-access screen |
| 403 | `guild_cosmetic_not_owned` | cosmetics | Keep previous state; show "not owned" |
| 403 | `guild_emporium_rank_required` | Emporium purchase | Show the required rank |
| 403 | `guild_chain_rank_required` | chain start | Show the required rank |
| 403 | `guild_bounty_not_eligible` | bounty claim | Contribute first |
| 403 | — | admin route without `ADMIN`/`EDITOR` | Hide/forbid admin UI |
| 404 | — | unknown/foreign contract, board entry, event, reward, Emporium listing, bounty, chain | Refresh the relevant list |
| 404 | `guild_board_entry_not_found` | reroll | Refresh the board |
| 409 | `guild_active_contract_limit_reached` | accept / chain start / advance | Show `license.perks.maxActiveContracts` |
| 409 | `guild_contract_already_exists` | accept | Refresh board/contracts |
| 409 | `guild_contract_not_ready` | claim | Refresh the contract |
| 409 | `guild_contract_not_active` | abandon / extend | Refresh the contract |
| 409 | `guild_contract_expired` | extend | Refresh the contract |
| 409 | `guild_contract_already_extended` | extend | Hide the extend action |
| 409 | `guild_consumable_not_owned` | extend / permit activation | Refresh rewards/consumables |
| 409 | `guild_permit_already_active` | permit activation | Disable until next Monday |
| 409 | `guild_insufficient_seals` | Emporium purchase | Refresh `sealsBalance` |
| 409 | `guild_emporium_already_owned` | Emporium purchase | Mark owned |
| 409 | `guild_emporium_monthly_limit_reached` | Emporium purchase | Show this month's cap |
| 409 | `guild_reroll_not_available` | reroll | Only open weekly quests can be rerolled |
| 409 | `guild_reroll_unavailable` | reroll | No free reroll/charter/alternative |
| 409 | `guild_passport_milestone_not_reached` | passport claim | Show stamps still needed |
| 409 | `guild_passport_milestone_already_claimed` | passport claim | Mark claimed |
| 409 | `guild_chain_already_started` | chain start | Show the active chain |
| 409 | `guild_chain_already_completed` | chain start/advance | Show completion |
| 409 | `guild_chain_stage_active` | chain advance | Finish/abandon the current stage first |
| 409 | `guild_bounty_not_claimable` | bounty claim | Only published bounties and the 14-day window |
| 409 | `guild_bounty_nothing_to_claim` | bounty claim | Refresh the bounty |
| 409 | `guild_bounty_rules_locked` | admin bounty update | Show locked rules |
| 409 | `guild_event_rules_locked` | admin event update | Show locked rules |
| 409 | `guild_reward_identity_locked` | admin reward update | Create a new reward instead |
| 409 | — (message only) | duplicate slug/key, publish archived, window conflicts | Show `message` |
| 500 | — | internal invariant failure | Generic retry/error |

`guild_invalid_amount` is a server-internal Seals invariant (`400` if it ever surfaces) and is not reachable from valid client input.

## 10. Out of scope (unchanged)

Client UI, pixel-art assets, Lina sprites/animations, server-side localization, real-time contract readiness, player-to-player trading, real-money Seals, clan guilds, PvP leaderboards, and `DELETE` endpoints for Guild catalog rows.

## 11. Regenerating `server_swagger.json`

`server_swagger.json` is written by `src/main.ts` during application bootstrap (`SwaggerModule.createDocument(app, ...)` → `fs.writeFileSync("server_swagger.json", ...)`). Regenerate it by booting the built app once (`pnpm build` then `node dist/src/main.js`) against a migrated database; the file is written before the server starts listening. The committed file was regenerated from this worktree's build and includes every new/updated `/v1/guild` and `/v1/guild/admin` route, DTO, query/path parameter and response schema.

## 12. Verification

The hand-off was checked programmatically against `server_swagger.json` and the source constants:

- Every route/method/success status in section 2 exists in `server_swagger.json`; request/response schema names match; all 15 guild paths (19 operations) from the previous publish are still present, and the 18 new guild paths (21 new operations) are present.
- Every field in the DTO tables exists in the corresponding Swagger schema.
- All 31 `templateKey`s, their category/rank/min-rank/XP/Seals/objective/target/duration/reward and every chain/stage key/reward match `src/guild/guild-templates.constants.ts` and `src/guild/guild-chains.service.ts`.
- Every Lina trigger/pose in section 8.3 matches `LinaTrigger`/`LinaPose`; every rank row and perk matches `GUILD_RANK_PERKS`; every chest row matches `GUILD_CHEST_TIERS`; every consumable matches `GuildConsumableKey`.
- All 78 seeded reward keys in section 8.7 and all 16 Emporium listing ids match the migration chain and its `INSERT IGNORE` seeds.
