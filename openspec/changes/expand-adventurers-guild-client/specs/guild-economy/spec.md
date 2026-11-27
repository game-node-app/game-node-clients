# Spec Delta

## Purpose

Show Guild Seals, Lina's Emporium and the Guild consumables.

## ADDED Requirements

### Requirement: Seals balance
The Guild header and License card SHALL show `license.sealsBalance` with the Seal icon. After any mutation that changes Seals the balance SHALL refresh.

#### Scenario: Header balance
- **WHEN** the overview returns `license.sealsBalance: 150`
- **THEN** the header shows the Seal icon and `150`

### Requirement: Lina's Emporium
An Emporium tab SHALL read `GET /v1/guild/emporium` and show the balance, the time until `nextRotationAt`, the rotating showcase (`rotatingItems`) and the permanent shelf (`permanentItems`). Each listing SHALL show its reward label and art, kind, rarity, price, and its state: owned, monthly purchases against `maxPurchasesPerMonth`, required rank when above the user's rank, or insufficient Seals. Buy SHALL be enabled only when `canPurchase` is true, ask for confirmation with the price and resulting balance, call `POST /v1/guild/emporium/purchase` with the listing `id`, and on success refresh the Emporium, rewards and overview and show what was granted (including a chest result for chest listings). Purchase errors (`guild_insufficient_seals`, `guild_emporium_already_owned`, `guild_emporium_monthly_limit_reached`, `guild_emporium_rank_required`, 404) SHALL show translated messages and refresh the Emporium.

#### Scenario: Buy a License theme
- **WHEN** the user has 150 Seals and buys `license_obsidian_ledger` priced 120
- **THEN** the confirmation shows 120 and a remaining balance of 30, the request body is `{ "emporiumItemId": "f2af7e19-b835-4311-89de-88148b57c07d" }`, and afterwards the listing shows "Owned"

#### Scenario: Not affordable
- **WHEN** a listing has `canPurchase: false` because `sealsBalance < priceSeals`
- **THEN** its Buy button is disabled and it reads "Not enough Seals"

### Requirement: Consumables
The rewards panel SHALL list the counts of `hourglass`, `reroll_charter` and `extra_slot_permit` from `GET /v1/guild/rewards` with their effects. The Extra Slot Permit SHALL offer "Activate" when owned; after confirmation it SHALL call `POST /v1/guild/consumables/extra_slot_permit/activate`, show the active-until date and refresh the overview (cap) and rewards. `guild_permit_already_active` and `guild_consumable_not_owned` SHALL show translated messages.

#### Scenario: Activate permit
- **WHEN** the user owns one permit and activates it
- **THEN** the response's `expiresAt` is shown as the active-until date and the permit count becomes `remainingPermits`
