# Spec Delta

## Purpose

Presents GameNode platform achievements on web and mobile. Players see what exists, how far they have progressed, which tiers they hold, how rare they are, and which time-limited events are running.

## ADDED Requirements

### Requirement: Tiered achievement badge
Every platform achievement SHALL be shown as a badge built from its icon descriptor and the tier being displayed. A `glyph` descriptor shows the named glyph, `game_cover` shows that game's cover, and `image` shows the server-published icon. The frame color SHALL distinguish tier levels. An unknown glyph name SHALL fall back to a default glyph instead of failing.

#### Scenario: Legacy achievement badge
- **WHEN** an achievement with icon `{ kind: "image", name: "space-station" }` is displayed at tier 1
- **THEN** the badge shows the server icon `space-station` in the tier 1 frame

#### Scenario: Game cover badge at a higher tier
- **WHEN** an achievement with icon `{ kind: "game_cover", gameId: 1164 }` is displayed at tier 3
- **THEN** the badge shows the cover of game 1164 in the tier 3 frame, distinct from the tier 1 frame

#### Scenario: Unknown glyph
- **WHEN** the descriptor names a glyph the client does not ship
- **THEN** the badge shows the default glyph and the page keeps rendering

### Requirement: Achievement catalog with progress
The achievements page of a user SHALL list the published catalog and that user's progress, fetched with one catalog request and one progress request, not one request per achievement. Each item SHALL show name, description, badge at the highest obtained tier (or locked when none), current value, next threshold and the XP of the next tier. When every tier is obtained, the item SHALL show it as complete.

#### Scenario: Partial progress
- **WHEN** a user with value 37 views an achievement with tiers 10, 50 and 100
- **THEN** the item shows tier 1 obtained, a progress bar at 37 of 50 and the XP of tier 2

#### Scenario: Never evaluated
- **WHEN** the progress response has value 0 and tier 0 for an achievement
- **THEN** the item shows the locked badge and a progress bar at 0 of the first threshold

#### Scenario: All tiers obtained
- **WHEN** the progress response has `nextThreshold` null
- **THEN** the item shows the badge at the highest tier and marks the achievement complete without a progress bar

### Requirement: Obtained achievements listed first
The page SHALL list achievements the user holds at least one tier of before achievements not yet obtained.

#### Scenario: Mixed catalog
- **WHEN** a user holds 2 of 15 published achievements
- **THEN** those 2 appear in the obtained section and the other 13 in the not-yet-obtained section

### Requirement: Tier list and rarity
Each achievement SHALL expose its tiers, each with threshold, XP reward, rarity as a percentage of profiles, and whether the viewed user holds it.

#### Scenario: Inspecting tiers
- **WHEN** a viewer opens the tier details of an achievement with three tiers
- **THEN** each tier shows threshold, XP, rarity percentage, and an obtained mark for the tiers the viewed user holds

### Requirement: Secret achievements stay masked
A secret achievement that the viewed user has not obtained SHALL be shown as a hidden placeholder, without name, description, criteria or icon. When the viewed user has obtained it, it SHALL appear complete.

#### Scenario: Secret not obtained
- **WHEN** the catalog returns a hidden achievement with null name and icon
- **THEN** the page shows a "secret achievement" placeholder with a masked badge

#### Scenario: Secret obtained by the viewed user
- **WHEN** the viewed user has obtained a secret achievement
- **THEN** the catalog request for that user returns it complete and the page shows its name, description and badge

### Requirement: Event sections
Achievements tied to an event SHALL be grouped under that event. Active events SHALL be shown with their end date. Past events SHALL be shown separately, and their tiers that the user obtained SHALL stay visible. Upcoming events SHALL NOT be shown.

#### Scenario: Active event
- **WHEN** an event is active and has two published achievements
- **THEN** the page shows a section with the event name, its end date and both achievements with progress

#### Scenario: Event ended
- **WHEN** an event's end date has passed
- **THEN** its achievements appear under past events, and the tiers the user obtained stay shown as obtained

### Requirement: Featured achievements show the highest tier
Featured achievements on a profile SHALL be shown with the badge at the highest tier the user holds for each achievement.

#### Scenario: Tier gained after featuring
- **WHEN** a user featured an achievement at tier 1 and later obtained tier 2
- **THEN** the profile shows that achievement with the tier 2 badge

### Requirement: Unlock activity in the feed
A feed activity of type `ACHIEVEMENT_UNLOCKED` SHALL be shown as the user unlocking the named achievement at the given tier, with its badge. It SHALL accept likes and comments through the same controls as other activities.

#### Scenario: Follower sees an unlock
- **WHEN** a followed user unlocks tier 2 of "Horror critic"
- **THEN** the feed shows that the user unlocked "Horror critic" tier 2 with the tier 2 badge, and the like and comment controls work
