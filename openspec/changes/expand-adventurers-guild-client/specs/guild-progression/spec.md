# Spec Delta

## Purpose

Show the Monthly Guild Passport, Prestige, rank perks and the expanded equippable cosmetics.

## ADDED Requirements

### Requirement: Monthly Guild Passport
A Passport card SHALL read `GET /v1/guild/passport` and show `completedContractsCount` as stamps, the time until `resetsAt`, and the milestones 2, 4 and 6 with their chest tier, Seals and consumable rewards and status. A `claimable` milestone SHALL offer Claim, which calls `POST /v1/guild/passport/claim/{milestone}` and shows the chest result, `sealsAwarded`, any consumable and XP; `claimed` milestones SHALL be marked as claimed; `locked` ones SHALL show how many contracts are still needed.

#### Scenario: Claim milestone 4
- **WHEN** the passport has `completedContractsCount: 4` and milestone 4 is `claimable`
- **THEN** Claim on milestone 4 calls `POST /v1/guild/passport/claim/4` and the result shows the Silver Chest and the awarded Seals, after which milestone 4 is marked claimed

### Requirement: Prestige and perks
At rank `S` with `prestigeLevel > 0` the header and License SHALL show the Prestige level (`Prestige N`, stars) and progress from `prestigeXpIntoCurrent` and `xpToNextPrestige`. The License SHALL list the rank perks from `license.perks` (active-contract cap, weekly rerolls, Monthly Expedition access, Rank S expeditions, free monthly Hourglass, legendary contracts).

#### Scenario: Prestige 1
- **WHEN** the overview returns `rank: "S"`, `prestigeLevel: 1`, `prestigeXpIntoCurrent: 800`, `xpToNextPrestige: 1700`
- **THEN** the header shows rank S with one prestige star and a bar at 800 / 2500 labelled "Prestige 1"

### Requirement: Expanded cosmetics
The rewards panel SHALL list owned rewards of every permanent kind (titles, frames, License themes, stamp styles, tavern decor, badges) with rarity, and SHALL let the user equip or clear a title, frame, License theme and stamp style, choose up to 4 tavern decor items and up to 3 showcase badges, each through `PATCH /v1/guild/cosmetics` with only the changed field. On `guild_cosmetic_not_owned` or `guild_cosmetic_limit_exceeded` the previous selection SHALL be kept and a translated message shown. The License card SHALL apply the equipped License theme and stamp style and show the Trophy Showcase (3 slots). The hall scene SHALL draw the equipped tavern decor on Lina's counter (up to 4 on desktop, the first 2 on mobile), with a generic prop for unknown keys.

#### Scenario: Equip decor
- **WHEN** the user owns `decor_sleeping_cat` and `decor_mug_of_ale`, has `equippedDecorKeys: ["decor_mug_of_ale"]` and adds the cat
- **THEN** the request body is `{ "equippedDecorKeys": ["decor_mug_of_ale", "decor_sleeping_cat"] }` and the scene shows both props

#### Scenario: Decor limit
- **WHEN** four decor items are equipped
- **THEN** adding another is disabled with the "Up to 4" hint
