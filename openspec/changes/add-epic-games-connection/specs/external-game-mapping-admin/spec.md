# Spec Delta

## Purpose

Gives moderators and admins the tools to maintain GameNode-owned external game mappings in the admin app: identifying and resolving unmapped external games with curated mappings, and starting bulk mapping fills.

## ADDED Requirements

### Requirement: Unmapped entries identify their source
The unmapped external games table SHALL name every category the server can return, including `1001` as "Epic Games Namespace". Each row's visit action SHALL open a page where a moderator can identify the external game: SteamDB for Steam, and an Epic catalog lookup by namespace for Epic Games Namespace. For categories without a lookup, the action SHALL be disabled instead of showing an alert.

#### Scenario: Epic namespace row
- **WHEN** the unmapped table contains an entry with category `1001` and source ID `9773aa1aa54f4f7b80e44bef04986cea`
- **THEN** its source reads "Epic Games Namespace" and its visit action opens the Epic catalog lookup for that namespace in a new tab

#### Scenario: Category without a lookup
- **WHEN** an entry's category has no known lookup page
- **THEN** its visit action is disabled

### Requirement: Matching an unmapped entry
The table's "Match" action SHALL let a moderator pick a catalog game, review a prefilled and editable source URL, and submit `POST /v1/game/external` with the entry's source ID and category. On success, the entry SHALL leave the active list. On HTTP 409, the admin SHALL explain that IGDB already maps this ID and leave the entry in place.

#### Scenario: Curated match
- **WHEN** a moderator matches an Epic namespace entry to a game and confirms
- **THEN** the mapping is submitted with category `1001`, a success notification shows, and the entry disappears from the table after refetch

#### Scenario: IGDB already maps the ID
- **WHEN** the server responds HTTP 409
- **THEN** the dialog shows that IGDB already maps this source ID and nothing else changes

#### Scenario: Invalid source URL
- **WHEN** the source URL field is empty or not a valid URL
- **THEN** submission is blocked with an inline error

### Requirement: Starting the Epic namespace bulk fill
The external games admin page SHALL show an Epic namespace fill panel that explains what the job does and lets an admin start it through `POST /v1/game/external/fill/epic`. After the trigger, the panel SHALL show the returned job ID and state. A trigger that reports an already queued or active run SHALL be shown as such, not as an error. A rejected trigger, such as from a non-admin, SHALL show the server error.

#### Scenario: Starting a run
- **WHEN** an admin selects "Run Epic namespace fill"
- **THEN** the request is sent once, the button shows loading, and the panel then shows `epic-namespace-fill` with its state, such as `waiting` or `active`

#### Scenario: Run already in progress
- **WHEN** the response state is `active` or `waiting` because a previous run is still going
- **THEN** the panel shows that a run is already in progress

#### Scenario: Moderator without admin role
- **WHEN** the server rejects the trigger with HTTP 403
- **THEN** the panel shows the error and no state badge
