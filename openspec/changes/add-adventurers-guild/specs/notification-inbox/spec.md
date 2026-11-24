# Spec Delta

## ADDED Requirements

### Requirement: Guild contract-ready notifications
An inbox item of type `guild.contract-ready` SHALL be rendered as an individual item without actor avatar, using `preview.game` (cover and name) when present and a localized "Your Guild contract is ready to turn in" text. Activating it SHALL navigate to `/guild` with the accepted contracts tab selected and acknowledge the item as read. If the contract is no longer `ready_to_claim`, the Guild SHALL simply show the refreshed list, without an error.

#### Scenario: Contract ready rendered
- **WHEN** the inbox contains a `guild.contract-ready` item with `preview.game.name` "Hollow Knight" and `target: { type: "guild", contractId: "c1" }`
- **THEN** the item shows the Hollow Knight cover and says the Guild contract for Hollow Knight is ready to turn in

#### Scenario: Contract ready activated
- **WHEN** the user activates that item
- **THEN** the client opens `/guild?tab=accepted` and marks the item as read

### Requirement: Guild contract-expiring notifications
An inbox item of type `guild.contract-expiring` SHALL be rendered like `guild.contract-ready` (individual, no actor avatar, `preview.game` cover and name when present) with a localized "Your Guild contract expires in less than 24 hours" text. Activating it SHALL navigate to `/guild?tab=accepted` and acknowledge the item as read; the deadline shown there comes from the contract's `expiresAt`. If the contract is no longer `active`, the Guild SHALL show the refreshed list without an error.

#### Scenario: Contract expiring rendered
- **WHEN** the inbox contains a `guild.contract-expiring` item with `preview.game.name` "Hollow Knight" and `target: { type: "guild", contractId: "c1" }`
- **THEN** the item shows the Hollow Knight cover and says the Guild contract for Hollow Knight expires in less than 24 hours, and activating it opens `/guild?tab=accepted`
