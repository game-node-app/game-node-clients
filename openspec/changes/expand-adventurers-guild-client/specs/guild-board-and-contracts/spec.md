# Spec Delta

## Purpose

Show the expanded quest board and contract loop of the Adventurers Guild: Monthly Expeditions, rerolls, bonus objectives, Guild Seals on quests and contracts, contract extension and the expanded claim celebration.

## ADDED Requirements

### Requirement: Expanded quest cards
Every quest card SHALL show `sealsReward` (when greater than 0) next to the XP reward, localized copy for all 31 `templateKey`s of hand-off 8.1, the reward label for every reward kind (chests named by tier, `weekly_chest` as the Silver-equivalent legacy chest), and the procedural `meta` values (`genreName`, `franchiseName`, `themeName`, `decade`, `staleDays`, `sinceYear`, `estimatedHours`) when present. A non-null `bonusObjective` SHALL be shown as optional with its condition and its reward (`bonusXp`, `bonusSeals`, `upgradeChestTier`) and SHALL NOT affect accepting. Unknown template keys, reward keys, categories or bonus types SHALL render a generic label and keep the card.

#### Scenario: Seals and bonus on a weekly quest
- **WHEN** the board returns a `campaign_rhythm` quest with `xpReward: 150`, `sealsReward: 20` and `bonusObjective: { type: "finish_before_half_deadline", bonusSeals: 10 }`
- **THEN** the card shows "Campaign Rhythm", `+150 XP`, `+20 Seals` and an optional bonus line mentioning finishing before half the deadline and `+10 Seals`

#### Scenario: Unknown template
- **WHEN** a quest has `templateKey: "future_quest"`
- **THEN** the card renders with a generic title instead of being hidden

### Requirement: Monthly Expedition
A quest with `cycle: "monthly"` SHALL be rendered first on the full board as a full-width card with the "Monthly Expedition" tag, its accept-by date from `expiresAt` and its `contractDurationDays`. When `monthlyExpeditionLocked` is true and the board is not in quick mode, a locked teaser stating that expeditions unlock at Rank C SHALL be shown instead.

#### Scenario: Rank C member
- **WHEN** the board contains a `the_colossus` quest with `category: "monthly"`, `cycle: "monthly"`, `contractDurationDays: 45`
- **THEN** it is the first card, tagged "Monthly Expedition", shows "The Colossus", the accept-by date and "45 days to finish after accepting"

#### Scenario: Rank E member
- **WHEN** the board returns `monthlyExpeditionLocked: true`
- **THEN** a locked Monthly Expedition teaser reading that it unlocks at Rank C is shown and no request is made for it

### Requirement: Board reroll
Open weekly board quests (`cycle: "weekly"`, `sourceType: "board_entry"`) SHALL offer a Reroll action when `rerollsRemaining > 0` or `rerollChartersOwned > 0`, labelled with which one it spends. Reroll SHALL call `POST /v1/guild/board/{boardEntryId}/reroll`, replace that card with the returned `quest` in place and update the reroll counters. Monthly, event and quick-only cards SHALL NOT offer reroll. `guild_reroll_not_available` and `guild_reroll_unavailable` SHALL show their translated message and refresh the board; `guild_board_entry_not_found` SHALL refresh the board.

#### Scenario: Free reroll
- **WHEN** the board has `rerollsRemaining: 1` and the user rerolls a weekly card
- **THEN** the request targets that card's `boardEntryId`, the card is replaced by the returned quest and no further free reroll is offered (charters permitting)

### Requirement: Contract cap, Seals, bonus and extension
The client SHALL read the active-contract cap from `license.perks.maxActiveContracts` (never a hard-coded 3) for the Active contracts header and the limit error message. Contract rows SHALL show `sealsReward`, the bonus objective with its completion state (`bonusCompleted`), and the chain stage when the contract belongs to the active chain. Active contracts with `extendedCount === 0` and a future `expiresAt` SHALL offer "Extend +7 days" when the user owns an Hourglass or has `monthlyFreeHourglass > 0`; after confirmation it SHALL call `POST /v1/guild/contracts/{id}/extend`, show the new deadline and whether the free monthly Hourglass was used, and map `guild_contract_already_extended`, `guild_contract_expired`, `guild_contract_not_active` and `guild_consumable_not_owned` to translated messages with a refresh.

#### Scenario: Rank B cap
- **WHEN** the overview has `license.perks.maxActiveContracts: 4` and accepting fails with `guild_active_contract_limit_reached`
- **THEN** the message says the user already has 4 active contracts

#### Scenario: Extend with an Hourglass
- **WHEN** an active contract has `extendedCount: 0` and the rewards read has `consumables.hourglass: 1`
- **THEN** "Extend +7 days" is offered, and after a successful call the row shows the returned `expiresAt` and no extend action

### Requirement: Expanded claim celebration
The claim celebration SHALL show, in addition to Guild XP, account XP and rank change: `sealsAwarded`; the completed bonus objective when `bonusCompleted`; the chest tier from `chestResult.chestKind` with its bonus XP/Seals, the unlocked cosmetic (with rarity) or the exhausted-pool conversion, and any `grantedConsumable`; every `promotionRewards` item under the Rank package label; one Relic chest block per `prestigeRewards` entry; the passport stamp count from `passportMonth`; chain progress or, when `chainProgress.chainCompleted`, the final rewards and `bonusSealsAwarded`. Lina's line SHALL come from the response `lina` so `rank_promoted` and `chain_completed` use their own copy.

#### Scenario: Promotion claim
- **WHEN** a claim returns `rankBefore: "C"`, `rankAfter: "B"`, `sealsAwarded: 95`, `promotionRewards: [frame_forged_steel, decor_sleeping_cat]`, `chestResult.chestKind: "chest_silver"` and `lina.trigger: "rank_promoted"`
- **THEN** the celebration shows `+95 Seals`, the Silver Chest, "Veteran's Kit" with Forged Steel and Sleeping Cat, `C → B`, and Lina's rank promotion line
