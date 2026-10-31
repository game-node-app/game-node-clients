# Spec Delta

## ADDED Requirements

### Requirement: Achievement unlock notifications
An inbox item of type `achievement.unlocked` SHALL be rendered as an individual item. It SHALL show the achievement name from the materialized preview and the tier from `target.tier`, without per-item requests during list rendering. Activating it SHALL navigate to the recipient's achievements page.

#### Scenario: Unlock rendered
- **WHEN** the inbox contains an `achievement.unlocked` item with preview "Horror critic" and target `{ type: "achievement", id: "horror-critic", tier: 2 }`
- **THEN** the item shows that "Horror critic" tier 2 was unlocked, with no actor avatar

#### Scenario: Unlock activated
- **WHEN** the user activates that item
- **THEN** the client navigates to the user's own achievements page and acknowledges the item as read
