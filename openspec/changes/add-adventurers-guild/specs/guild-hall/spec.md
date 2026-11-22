# Spec Delta

## Purpose

Render the Adventurers Guild Hall: the player's Guild License, weekly quest board and contracts, and the actions that accept, claim and abandon contracts and equip Guild cosmetics.

## ADDED Requirements

### Requirement: Hall header and License
The Guild Hall SHALL show a header with the Guild title, a subtitle stating the board refreshes every Monday with the time remaining until `nextRefreshAt`, the current rank badge (`RANK <rank>`) and an XP bar computed from `currentRankMinXp`, `xp` and `nextRankXp` of `GET /v1/guild`. The License card SHALL show the license number formatted as `Nº` plus four zero-padded digits, the equipped Guild title (falling back to the rank title), the member-since year, a rank stamp, finished/backlog/reviews stats and "Next rank: X · Y XP left". At rank `S` the progress SHALL be shown full with no next rank.

#### Scenario: License rendered
- **WHEN** the overview returns `licenseNumber: 47`, `rank: "C"`, `xp: 1240`, `currentRankMinXp: 800`, `nextRank: "B"`, `nextRankXp: 2000`, `xpToNextRank: 760`, stats `47/23/12`
- **THEN** the card shows `Nº 0047`, a `C` stamp, `47` finished, `23` in backlog, `12` reviews, next rank `B` and `760 XP` left, and the header shows `1.240 / 2.000 XP` in pt-BR number formatting

#### Scenario: Maximum rank
- **WHEN** the overview returns `rank: "S"` with `nextRank: null`
- **THEN** the XP bars are full and no "next rank" value is shown

### Requirement: Board tabs and quest cards
The hall SHALL show tabs "Quest board", "Accepted" and "Completed" with counts from `counts.boardCount`, `counts.acceptedCount` and `counts.completedCount`, and a refresh countdown. The board tab SHALL render each quest of `GET /v1/guild/board` as a parchment card with: a category tag (`library`, `event`, `weekly`, `gamenode` with their own colors), an icon, the title and description (localized from `templateKey`, or from the event translation matching the current locale, falling back to the base `title`/`description`), a rank stamp, up to three candidate game chips with cover, name and `since <year>` or `~<hours>h`, the XP reward and reward label, and "Not now" / "Accept" buttons. The quest with `isRecommended: true` SHALL be highlighted with the brand border and a "★ Lina recommends" seal. Event quests SHALL show the days remaining until `expiresAt` in their tag. Unknown template or reward keys SHALL render a generic label instead of being hidden.

#### Scenario: Recommended library quest
- **WHEN** the board returns a `forgotten_relic` quest with `isRecommended: true`, rank `B`, `xpReward: 250` and reward `badge_archaeologist`
- **THEN** the card shows the "From your library" tag, "Forgotten Relic", the `B` stamp, `+250 XP`, the Archaeologist badge label and the "★ Lina recommends" seal

#### Scenario: Quick quests
- **WHEN** the user chooses Lina's "Any quicker quest?" option
- **THEN** the board is re-read with `quick=true` and only those quests are shown, with a way back to the full board

#### Scenario: Not now
- **WHEN** the user presses "Not now" on a card
- **THEN** the card is hidden for the rest of the current session view without any server request

### Requirement: Accepting a contract
"Accept" SHALL call `POST /v1/guild/contracts` with exactly one of `boardEntryId` or `eventId`. When the quest has `requiresTargetGame: true`, the client SHALL ask the user to pick one of the `candidateGames` (pre-selecting the first) and send it as `targetGameId`. On success the client SHALL show the "Contract accepted" state built from the response `contract` and `lina`, and refresh overview, board and contracts. Errors SHALL be shown by code: `guild_active_contract_limit_reached` explains the three-contract limit, `guild_contract_already_exists` refreshes the board, and a 400 shows the server message.

#### Scenario: Accept with target game
- **WHEN** the user accepts a `forgotten_relic` quest whose candidates are Hollow Knight and Celeste and keeps Hollow Knight selected
- **THEN** the request body is `{ "boardEntryId": "<id>", "targetGameId": 1029 }` and the accepted state shows "Forgotten Relic", target Hollow Knight, `B · +250 XP` and the `ACEITO` stamp

#### Scenario: Contract limit
- **WHEN** the accept request returns 409 `guild_active_contract_limit_reached`
- **THEN** the user is told they can hold at most three active contracts and no contract is added

### Requirement: Contract lists, claim and abandon
The "Accepted" tab SHALL list `GET /v1/guild/contracts?tab=accepted` and the "Completed" tab `?tab=completed`, paginated. Each contract SHALL show title, target game, progress (`progressCurrent/progressTarget`, or `playtimeProgress.estimatedPercent` with played vs. estimated hours when present), accepted time and status. `ready_to_claim` contracts SHALL be listed first with a "Turn in" action that calls `POST /v1/guild/contracts/{id}/claim` and then shows a celebration with `xpAwarded`, the rank change when `rankBefore !== rankAfter`, each newly unlocked reward and the chest result. `active` contracts SHALL offer "Abandon" with a confirmation that calls the abandon endpoint. The sidebar "Active contracts" list SHALL show `activeContracts` and the year goal (`finished/target`, days remaining in the year) when `yearGoal` is not null. A 409 `guild_contract_not_ready` or `guild_contract_not_active` SHALL refresh the lists.

#### Scenario: Claim celebration with rank up
- **WHEN** a claim returns `xpAwarded: 325`, `rankBefore: "C"`, `rankAfter: "B"` and a `weekly_chest` result with `bonusXp: 75` and an unlocked `frame_lantern_glow`
- **THEN** the celebration shows `+325 XP`, the rank change C → B and "Lantern Glow" as a new frame, and the overview is refreshed

#### Scenario: Ready contract after deadline
- **WHEN** a `ready_to_claim` contract has an `expiresAt` in the past
- **THEN** it is still listed with the "Turn in" action

### Requirement: Rewards and cosmetics
The hall SHALL list `GET /v1/guild/rewards` (badges, titles, frames) and let the user equip or unequip a title and a frame through `PATCH /v1/guild/cosmetics`, re-reading the equipped keys from the response. `guild_cosmetic_not_owned` SHALL keep the previous selection and show a "not owned" message. The equipped title SHALL replace the rank title in the License card and header.

#### Scenario: Equip title
- **WHEN** the user equips `title_chronist`
- **THEN** the request body is `{ "guildTitleKey": "title_chronist" }` and the License shows "Chronicler"

### Requirement: Responsive layout
At widths below the desktop breakpoint, the hall SHALL use the mobile layout of frame `8:268`: compact header with rank and XP, scene scaled to 5×, dialogue box below the scene, active contracts, tabs labelled "Quests / Accepted / Completed" and a single-column board. Desktop SHALL follow frame `6:2`: 340 px sidebar plus a two-column cork board.

#### Scenario: Mobile width
- **WHEN** the hall is rendered at 390 px wide
- **THEN** the dialogue box is below the scene, the License card is not in a side column and quest cards are stacked in one column
