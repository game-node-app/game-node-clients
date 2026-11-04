# Spec Delta

## ADDED Requirements

### Requirement: Library uses desktop data only
The library SHALL NOT read the user's web connections or importer entries (`/v1/connections/*`, `/v1/importer/*`), and SHALL NOT import games through the importer. Every listed game SHALL come from a desktop game source.

#### Scenario: Signed-in user with linked web stores
- **WHEN** a user with Steam and PSN linked on the GameNode website opens the desktop library
- **THEN** the app sends no request to `/v1/connections/*` or `/v1/importer/*` and lists none of those web-store games

### Requirement: Empty library
When no desktop game source has found any game, the library SHALL show an empty state saying that games installed on this PC will appear here. It SHALL NOT link to the web connections page.

#### Scenario: No games found
- **WHEN** a signed-in user opens the library and no game source has found a game
- **THEN** the content area shows the empty state and no link to GameNode connections

## MODIFIED Requirements

### Requirement: Sidebar filters with counts
The library SHALL have a sidebar with a filter for all games and one filter per game source that has found games. Each filter SHALL show how many games it matches.

#### Scenario: Filter by store
- **WHEN** the user clicks the Steam filter
- **THEN** only Steam games are listed and the filter shows the Steam game count

### Requirement: Grid and list views with sorting
The library SHALL offer a cover grid and a detailed list with columns for name, source and year. The user SHALL be able to sort the list by any of those columns.

#### Scenario: Switch view and sort
- **WHEN** the user switches to list view and clicks the Year column header
- **THEN** games are shown as rows sorted by year, and clicking the header again reverses the order

### Requirement: Keyboard-first navigation
Typing while the library has focus SHALL filter games by name. Arrow keys SHALL move the focused game, Enter SHALL open its details, Space SHALL toggle its selection, Ctrl+A SHALL select all listed games and Ctrl+1/Ctrl+2 SHALL switch between grid and list.

#### Scenario: Type to filter
- **WHEN** the user types "hollow" with no text field focused
- **THEN** the list narrows to games whose name contains "hollow" and the typed query is visible and clearable with Escape

#### Scenario: Navigate and select by keyboard
- **WHEN** the user presses Down twice, then Space
- **THEN** the third game is focused and selected

### Requirement: Native context and application menus
Right-clicking a game SHALL open a system context menu acting on the selection (or the clicked game when it is not selected) with Open on GameNode and Copy name. The application menu SHALL offer the same library actions with their shortcuts.

#### Scenario: Context menu on selection
- **WHEN** three games are selected and the user right-clicks one of them and picks Copy name
- **THEN** the three names are copied to the clipboard

#### Scenario: Open on GameNode
- **WHEN** the user picks Open on GameNode for a game matched to a GameNode game
- **THEN** that game's page opens in the system browser

### Requirement: Detail pane
Selecting or opening a game SHALL show a resizable detail pane with its cover, name, source, year and matched GameNode game.

#### Scenario: Open details
- **WHEN** the user presses Enter on a focused game
- **THEN** the detail pane shows that game's details

## REMOVED Requirements

### Requirement: Unified library of owned games
**Reason**: Desktop uses desktop data only; owned games came from web connections through the importer.
**Migration**: Step 2 of the roadmap lists installed games from local providers.

### Requirement: Import owned games into GameNode
**Reason**: Desktop does not use the importer.
**Migration**: Step 2 adds a game to the GameNode library from the detail pane through collection entries; desktop-found games reach the web importer through step 5 reporting.

### Requirement: Instant start from cache and offline view
**Reason**: The cache held importer data. Local scans in step 2 do not need a server round trip to show the library.
**Migration**: None; the persisted query cache is removed.

### Requirement: Library guides users without linked stores
**Reason**: Web store links no longer feed the desktop library.
**Migration**: Replaced by "Empty library".

### Requirement: Per-store load failures
**Reason**: There are no per-store server loads anymore.
**Migration**: Step 2 defines provider scan failures.
