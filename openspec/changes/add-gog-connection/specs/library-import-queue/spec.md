# Spec Delta

## Purpose

Lets players review and process games discovered through connected stores while preserving provider coverage, collection preferences and server-supplied activity data.

## ADDED Requirements

### Requirement: GOG import source and notifications
Importer routes and source selectors SHALL accept `gog`, display "GOG" and use its existing icon. GOG import discovery notifications SHALL preserve counts, samples and importer navigation through the existing notification contract.

#### Scenario: Open GOG import queue
- **WHEN** a connected player selects GOG or opens `/importer/gog` on web or mobile
- **THEN** the existing queue requests GOG entries and supports selection, import all, processed/ignored status, pagination and search

#### Scenario: GOG discovery notification
- **WHEN** an `import.discovery-completed` notification has a GOG importer target/preview
- **THEN** it names GOG, shows the GOG icon, retains server result counts and samples, and opens `/importer/gog`

### Requirement: GOG owned library and collection semantics
GOG queues SHALL support owned GOG games including unplayed titles, with server-preferred PC platform `6`. The client SHALL preserve existing batch processing and automatic collection behavior, delegate ownership validation to the server and use its results. Other stores linked through Galaxy SHALL NOT be represented as GOG imports.

#### Scenario: Unplayed owned game
- **WHEN** a GOG queue contains a game with no recorded play activity and `preferredPlatformId: 6`
- **THEN** it remains selectable and importable using source `gog`, without a playtime-based filter or client platform override

#### Scenario: Existing processing and automatic collection preferences
- **WHEN** the player imports or ignores a GOG selection, or configures automatic imports into a collection
- **THEN** the existing external-ID batch requests, processed/ignored behavior, result counts and cache updates apply
- **AND** existing entries are preserved and invalid/non-owned collections produce the existing visible server validation error

#### Scenario: Galaxy cross-store coverage
- **WHEN** the connection is described to the player or the server returns owned GOG games
- **THEN** the UI explains that other stores linked through Galaxy are excluded and does not promise or synthesize those games

### Requirement: GOG recorded playtime limits
The client SHALL retain the existing playtime source `gog` and show GOG-recorded cumulative activity without fabricating missing dates or counts. Localized GOG coverage text SHALL explain that offline play never recorded by GOG cannot be imported.

#### Scenario: Cumulative activity without optional metadata
- **WHEN** imported GOG playtime has a cumulative duration but lacks first/last played dates or session counts
- **THEN** the available duration remains usable, missing metadata stays missing and no inferred dates or counts are displayed

#### Scenario: Coverage before linking
- **WHEN** a player reads GOG setup in English or Brazilian Portuguese
- **THEN** it explains owned/unplayed game coverage, exclusion of other Galaxy stores and the limits of GOG-recorded playtime
