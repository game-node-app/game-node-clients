# Spec Delta

## Purpose

Define the Feats page a user sees on web (desktop and mobile widths) and in the native mobile app: level and XP summary, featured feat, near-completion feats, events, filters, per-tier feat cards, the tier details view and redeeming a code.

## ADDED Requirements

### Requirement: Same page on every client
The Feats page of a user SHALL render the same content and behavior on web desktop, web at mobile widths and the native mobile app, at the existing `/feats/:userId` routes. Layout SHALL adapt to width: feat grids use three columns on wide screens, two on medium and one on narrow screens. Detail and redeem dialogs SHALL open as bottom sheets in the native app.

#### Scenario: Native app opens the tier details
- **WHEN** a user taps "Níveis" on a feat card in the native app
- **THEN** the tier details open as a bottom sheet with the same content as the web dialog

#### Scenario: Narrow web viewport
- **WHEN** the web page is viewed at 390 px wide
- **THEN** feat cards stack in one column and the summary cards stack vertically

### Requirement: Profile level card
The page SHALL show the viewed user's avatar with a level ring and level pill, username, current level, the XP still needed to reach the next level, an experience bar with current and required XP, and the date the user joined.

#### Scenario: Level progress
- **WHEN** the viewed user is level 14 with 2340 of 2800 XP
- **THEN** the card shows "Nível 14", "faltam 460 XP para o 15", a bar at 2340 / 2800 XP and the join date

### Requirement: Feats summary
The page SHALL show how many feats the viewed user obtained out of the visible catalog total, how many tiers they hold in total, and the XP earned from feats (sum of the XP of every obtained tier). The total SHALL exclude past-event feats the user did not obtain and upcoming-event feats.

#### Scenario: Summary numbers
- **WHEN** the user holds tiers 1–3 of one feat (10, 25, 50 XP) and tier 1 of another (40 XP), out of 24 visible feats
- **THEN** the summary shows "2 / 24" feats obtained, 4 tiers conquered and 125 XP from feats

### Requirement: Featured feat slot
The summary SHALL show the first featured feat of the viewed user with its name and highest obtained tier. When the viewer owns the page, the slot SHALL offer "Trocar", which lets them pick one obtained feat to feature. When nothing is featured, the owner SHALL see an empty slot that opens the same picker; other viewers SHALL see no slot.

#### Scenario: Owner swaps the featured feat
- **WHEN** the owner picks "Roll Credits" in the picker
- **THEN** "Roll Credits" becomes the only featured feat and the slot shows it

#### Scenario: Visitor with nothing featured
- **WHEN** a visitor opens the page of a user with no featured feat
- **THEN** no featured slot is shown

### Requirement: Featuring replaces the current featured feat
"Destacar no perfil" and the featured picker SHALL make the chosen obtained feat the user's only featured feat, removing any other. The action SHALL be offered only to the page owner and only for feats they hold at least one tier of. Failures SHALL show an error notification and keep the previous featured feat.

#### Scenario: Feature from the tier details
- **WHEN** the owner, with "Backlog Dragon" and "Chatterbox" featured, presses "Destacar no perfil" on "Critic's Corner"
- **THEN** "Critic's Corner" is the only featured feat and the summary slot shows it

#### Scenario: Feat not obtained
- **WHEN** the owner opens the tier details of a feat with tier 0
- **THEN** "Destacar no perfil" is not offered

### Requirement: Almost there
The page SHALL show up to three feats closest to their next tier, ranked by current value divided by next threshold, highest first. Only feats with progress above zero, a next tier, not secret and not from an ended event SHALL qualify. Each item SHALL show icon, name, description, a progress bar, value / threshold and the next tier's XP. The section SHALL be hidden when no feat qualifies.

#### Scenario: Ranking
- **WHEN** feats are at 8/10, 4/5, 21/25 and 2/50
- **THEN** "Quase lá" shows 21/25, 8/10 and 4/5 in that order

#### Scenario: Selecting an item
- **WHEN** the viewer selects an "Quase lá" item
- **THEN** the tier details of that feat open

### Requirement: Events section
The page SHALL list one row per active event and per ended event in which the viewed user obtained a feat, with the event icon, name, description, and a status: the end date for active events, "Evento encerrado" otherwise. A row SHALL show an "Obtida · +N XP" badge when the user holds feats of that event. Upcoming events SHALL NOT be shown. The section SHALL be hidden when it has no rows.

#### Scenario: Ended event with a feat obtained
- **WHEN** "Prêmios GameNode 2025" ended and the user obtained its feat worth 1000 XP
- **THEN** the row shows "Evento encerrado" and "Obtida · +1000 XP"

#### Scenario: Ended event without feats
- **WHEN** an event ended and the user obtained none of its feats
- **THEN** the event has no row in the section

### Requirement: Past events list
"Eventos passados" SHALL open a list of every ended event with its feats, showing which tiers the viewed user obtained and marking the rest as no longer obtainable. Feats of ended events the user did not obtain SHALL NOT appear in the main feat grid.

#### Scenario: Missed event feat
- **WHEN** the user did not obtain a feat of an ended event
- **THEN** the feat is absent from "Ainda não obtidas" and appears in "Eventos passados" as not obtainable

### Requirement: Feat filters
The page SHALL filter the feat grid by category (Todos, Coleção, Seguidores, Reviews, Comentários, Especiais, Eventos), by a text search over name and description, and by status (Todos, Obtidos, Bloqueados). Filters SHALL combine. "Todos" SHALL show the visible catalog count. When no feat matches, the page SHALL show an empty state instead of the sections.

#### Scenario: Category and status combined
- **WHEN** the viewer selects "Seguidores" and "Bloqueados"
- **THEN** only follower feats the user has not obtained are shown

#### Scenario: Search hides secret feats
- **WHEN** the viewer searches "dragon"
- **THEN** feats whose name or description contains "dragon" (case-insensitive) are shown and masked secret feats are not

### Requirement: Obtained and not obtained sections
The grid SHALL show "Obtidas" with the count of feats the user holds at least one tier of, then "Ainda não obtidas" with its count and how many of those are secret. All matching feats SHALL be shown without pagination. A section with no feats SHALL be hidden.

#### Scenario: Section headers
- **WHEN** the user holds 10 feats and 14 are not obtained, 2 of them secret
- **THEN** the headers read "Obtidas · 10 feitos" and "Ainda não obtidas · 14 feitos, 2 secretos"

### Requirement: Feat card
Each feat card SHALL show the icon as a rounded square tile, name, description, one segment per tier (obtained, in progress, locked), a progress bar to the next threshold, "value / threshold", the share of users holding the displayed tier and a "Níveis" action. Obtained feats SHALL show a "Nível N" badge; not obtained feats SHALL show their category badge instead.

#### Scenario: Multi-tier feat in progress
- **WHEN** the user holds tier 3 of 6 with value 61 and next threshold 250 worth 100 XP
- **THEN** the card shows "Nível 3", three obtained segments, one in-progress segment, two locked segments, a bar at 61/250, "Nível 4 de 6", "Próximo nível: 100 XP" and the rarity of tier 3

#### Scenario: Single-tier feat not obtained
- **WHEN** a one-tier feat worth 50 XP has value 8 of 10 and tier 0
- **THEN** the card shows its category badge, no tier segments, a bar at 8/10, "Recompensa: 50 XP" and the rarity of tier 1

### Requirement: Completed feat card
When the user holds every tier of a feat, its card SHALL show a "Completa" badge, "Obtida" and the total XP earned from it, without segments or progress bar.

#### Scenario: Completed one-tier feat
- **WHEN** the user holds the only tier of "Test Lab" worth 100 XP
- **THEN** the card shows "Completa", "Obtida" and "+100 XP ganhos"

### Requirement: Secret feat card
A secret feat the viewed user has not obtained SHALL render as a masked card: dashed border, a "?" tile, "Conquista secreta" with a "Secreta" badge, a placeholder description, an empty bar and "Nome e critério revelados ao obter". It SHALL NOT offer "Níveis".

#### Scenario: Masked secret
- **WHEN** the catalog returns a hidden feat with null name and icon
- **THEN** the masked card is shown in "Ainda não obtidas" with no tier details action

### Requirement: Tier details
"Níveis" SHALL open the feat's tier details: tile, "Nível N de M" and category badges, name, description, "Rumo ao nível N" with value / threshold in the metric's unit and a bar, and one row per tier with threshold, XP, share of users and status. Status SHALL be "Obtido em <date>" for held tiers, value / threshold for the next tier and "Bloqueado" for later tiers.

#### Scenario: Tier rows
- **WHEN** the user obtained tiers 1–3 on 03/11/2025, 19/12/2025 and 08/09/2026 and has 61 of 250 for tier 4 of 6
- **THEN** rows 1–3 show those dates, row 4 is highlighted with "61 / 250" and rows 5–6 show "Bloqueado"

#### Scenario: Unknown metric unit
- **WHEN** the feat's metric has no known unit
- **THEN** thresholds are shown as plain numbers

#### Scenario: Completed feat
- **WHEN** every tier is held
- **THEN** the progress line is replaced by the completion state and every row shows its obtained date

### Requirement: Redeem a code
The page owner SHALL be able to open "Resgatar um código", type a code (letters and numbers) and redeem it. "Resgatar" SHALL be disabled while the field is empty or a request is running. A rejected code SHALL show the server error under the field and keep the dialog open. Visitors SHALL NOT see the action.

#### Scenario: Invalid code
- **WHEN** the owner submits a code the server rejects as expired
- **THEN** the dialog stays open with the error under the field

#### Scenario: Visitor
- **WHEN** a signed-in user views someone else's Feats page
- **THEN** "Resgatar um código" is not shown

### Requirement: New feat reveal
After a code is redeemed, the client SHALL show a success notification and a "Novo feito" view with the unlocked feat's icon, name, description and the XP of the granted tier, plus "Ver meus feitos" (closes and shows the page) and "Destacar no perfil". The page's catalog, progress, level and featured data SHALL refresh.

#### Scenario: Successful redeem
- **WHEN** the owner redeems a code that grants tier 1 of "Test Lab" worth 100 XP
- **THEN** a green "Código resgatado com sucesso. Aproveite!" notification appears, the "Novo feito" view shows "Test Lab" and "+100 XP", and the summary counts include it

#### Scenario: Feat missing from the catalog
- **WHEN** the redeem response names a feat that the refreshed catalog does not contain
- **THEN** the dialog closes after the success notification without the reveal view

### Requirement: Server tier dates and redeem result
The progress endpoint SHALL return, for each feat, the obtained tiers with the date each was obtained. Redeeming a code SHALL return the id of the granted feat and the granted tier level. Both responses SHALL be described in the API schema.

#### Scenario: Progress with dates
- **WHEN** a client requests the progress of a user who obtained tiers 1 and 2 of a feat
- **THEN** that item includes both levels with their obtained timestamps

#### Scenario: Redeem response
- **WHEN** a code for "test-lab" is consumed
- **THEN** the response body is `{ "achievementId": "test-lab", "tier": 1 }`

### Requirement: Localized copy
Every user-facing string on the page SHALL come from the `en` and `pt-BR` translations, including metric units with singular and plural forms, and numbers and dates SHALL use the active locale's formatting.

#### Scenario: Portuguese locale
- **WHEN** the app language is pt-BR and a feat requires 1000 games
- **THEN** the threshold reads "1.000 jogos"
