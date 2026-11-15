# Spec Delta

## Purpose

Lets admins and editors create, test, publish and retire platform achievement definitions and events from the admin app, without code or a deploy.

## ADDED Requirements

### Requirement: Access limited to admins and editors
The definition and event screens SHALL appear in navigation and be usable only by users with the `admin` or `editor` role. Other signed-in users SHALL NOT see them, and a direct visit SHALL show a not-authorized state.

#### Scenario: Editor opens the admin
- **WHEN** a user with the `editor` role signs in to the admin
- **THEN** the navigation shows achievement definitions and events

#### Scenario: Moderator visits directly
- **WHEN** a user with only the `mod` role opens the definitions URL
- **THEN** the page shows a not-authorized state and no management controls

### Requirement: Definition list
The admin SHALL list all definitions with slug, name, metric, status (draft, published or archived), event and tier count, and SHALL allow filtering by status.

#### Scenario: Filter drafts
- **WHEN** an editor filters the list by draft
- **THEN** only draft definitions are shown

### Requirement: Metric-driven definition form
The definition form SHALL offer the metrics from the server's metric catalog with their descriptions. It SHALL show only the criteria filters the chosen metric accepts, and SHALL offer a time window only when the metric supports one. Own window and event SHALL be mutually exclusive in the form.

#### Scenario: Choosing followers
- **WHEN** an editor picks the `followers` metric
- **THEN** the form shows no game, theme, genre or year filters

#### Scenario: Metric without window support
- **WHEN** an editor picks `awards_participation`
- **THEN** the window and event fields are disabled, and the required `year` filter is shown

#### Scenario: Event chosen
- **WHEN** an editor links the definition to an event
- **THEN** the own start and end fields are cleared and disabled

### Requirement: Tier editing
The form SHALL edit 1 to 10 tiers, each with a threshold and an XP reward from 0 to 5000. Thresholds SHALL be strictly increasing. Invalid tiers SHALL be reported before submission, and server validation errors SHALL be shown without losing the form input.

#### Scenario: Thresholds out of order
- **WHEN** an editor enters thresholds 10 and 3
- **THEN** the form marks the tier invalid and does not submit

### Requirement: Icon selection with preview
The form SHALL let the editor choose a glyph from the glyphs the clients ship, a game cover by searching for a game, or an existing server icon by name. It SHALL preview the resulting badge at each configured tier.

#### Scenario: Picking a game cover
- **WHEN** an editor selects a game for a `game_cover` icon
- **THEN** the preview shows that game's cover in each tier frame

### Requirement: Published definitions lock their rules
For a published definition, the form SHALL keep metric, criteria, window and existing thresholds read-only. It SHALL allow editing name, description, icon and secrecy, and adding tiers above the last threshold. Archived definitions SHALL be read-only.

#### Scenario: Adding a tier after publication
- **WHEN** an editor adds a tier with a threshold above the last one to a published definition and saves
- **THEN** the tier is saved and the existing tiers stay unchanged

### Requirement: Editorial actions
Editors SHALL be able to publish and delete drafts and archive published definitions. Publish, archive and delete SHALL require confirmation. Delete SHALL be offered only for drafts. The confirmation for publishing or adding a tier SHALL warn that existing users will be granted retroactively.

#### Scenario: Publishing a draft
- **WHEN** an editor confirms publishing a draft
- **THEN** the definition shows as published and its rules become read-only

#### Scenario: Deleting a published definition
- **WHEN** an editor views a published definition
- **THEN** no delete action is offered

### Requirement: Simulation
Editors SHALL be able to simulate any definition, including drafts, for a chosen user. The result SHALL show the metric value and the tier levels that would be reached. Simulation SHALL NOT change any state.

#### Scenario: Simulating a draft
- **WHEN** an editor simulates a draft for a user with 7 matching reviews and tiers 1, 5 and 25
- **THEN** the result shows value 7 and levels 1 and 2

### Requirement: Event management
Editors SHALL be able to list, create and edit events (slug, name, description, start and end in UTC), and publish, archive and delete drafts with confirmation. Once an event is published, its start SHALL be read-only, and its end SHALL accept only later dates.

#### Scenario: Shortening a published event
- **WHEN** an editor tries to set an earlier end on a published event
- **THEN** the form rejects the date and nothing is saved
