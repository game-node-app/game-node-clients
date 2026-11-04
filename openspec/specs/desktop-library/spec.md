# desktop-library Specification

## Purpose
Defines the GameNode Desktop library: one desktop-native view of the games a signed-in user owns across their
linked stores, how they browse, select and inspect them, and how they import them into their GameNode library.

## Requirements

### Requirement: Unified library of owned games
The library SHALL show, in one list, the games the user owns on every linked store that supports importing, including games already in their GameNode library. Each game SHALL show its name, cover when known, source store and whether it is in the GameNode library.

#### Scenario: User with linked stores
- **WHEN** a signed-in user with Steam and PSN linked opens the library
- **THEN** one list shows their owned Steam and PSN games together, each labeled with its store and in-library state

#### Scenario: Large library
- **WHEN** the user owns several thousand games
- **THEN** all of them are reachable in the list and scrolling stays smooth

### Requirement: Sidebar filters with counts
The library SHALL have a sidebar with filters for all games, each linked store, games in the GameNode library and games not imported yet. Each filter SHALL show how many games it matches.

#### Scenario: Filter by store
- **WHEN** the user clicks the Steam filter
- **THEN** only Steam games are listed and the filter shows the Steam game count

### Requirement: Grid and list views with sorting
The library SHALL offer a cover grid and a detailed list with columns for name, store, year and in-library state. The user SHALL be able to sort the list by any of those columns.

#### Scenario: Switch view and sort
- **WHEN** the user switches to list view and clicks the Year column header
- **THEN** games are shown as rows sorted by year, and clicking the header again reverses the order

### Requirement: Keyboard-first navigation
Typing while the library has focus SHALL filter games by name. Arrow keys SHALL move the focused game, Enter SHALL open its details, Space SHALL toggle its selection, Ctrl+A SHALL select all listed games, Ctrl+I SHALL import the selection and Ctrl+1/Ctrl+2 SHALL switch between grid and list.

#### Scenario: Type to filter
- **WHEN** the user types "hollow" with no text field focused
- **THEN** the list narrows to games whose name contains "hollow" and the typed query is visible and clearable with Escape

#### Scenario: Navigate and select by keyboard
- **WHEN** the user presses Down twice, then Space
- **THEN** the third game is focused and selected

### Requirement: Mouse multi-selection
Clicking a game SHALL select only it, Ctrl+click SHALL toggle it in the selection and Shift+click SHALL select the range from the last clicked game.

#### Scenario: Range select
- **WHEN** the user clicks the second game and Shift+clicks the fifth
- **THEN** games two to five are selected

### Requirement: Native context and application menus
Right-clicking a game SHALL open a system context menu acting on the selection (or the clicked game when it is not selected) with Import, Import into collection, Open on GameNode and Copy name. The application menu SHALL offer the same library actions with their shortcuts.

#### Scenario: Context menu on selection
- **WHEN** three games are selected and the user right-clicks one of them and picks Import
- **THEN** the three games are imported

#### Scenario: Open on GameNode
- **WHEN** the user picks Open on GameNode for a game matched to a GameNode game
- **THEN** that game's page opens in the system browser

### Requirement: Detail pane
Selecting or opening a game SHALL show a resizable detail pane with its cover, name, store, year, matched GameNode game and in-library state, and an Import action when it is not in the library.

#### Scenario: Open details
- **WHEN** the user presses Enter on a focused game
- **THEN** the detail pane shows that game's details

### Requirement: Import owned games into GameNode
The user SHALL be able to import selected games not yet in their GameNode library, optionally into collections, with the same result as importing on the GameNode website. Games already in the library SHALL be skipped. Completion SHALL be reported with a system notification.

#### Scenario: Import selected games
- **WHEN** the user selects three owned games that are not in their library and imports them
- **THEN** the games are added to their GameNode library, a system notification reports three imported and the games show as in-library

#### Scenario: Import fails
- **WHEN** the import request fails
- **THEN** an error is shown and the games keep their previous state

### Requirement: Instant start from cache and offline view
The library SHALL show the last synced list immediately on start, then refresh in the background. When the server cannot be reached, the cached list SHALL stay visible read-only with the time of the last sync.

#### Scenario: Start with cache
- **WHEN** a user who synced before opens the app
- **THEN** their library appears before any network response and updates when the refresh completes

#### Scenario: Offline
- **WHEN** the app starts without network
- **THEN** the cached library is shown with "last synced" time and import actions are disabled

### Requirement: Remembered layout
The library SHALL restore across restarts the view mode, sort, active filter, sidebar width and detail pane width.

#### Scenario: Restore layout
- **WHEN** the user picks list view sorted by name, filters to PSN and restarts the app
- **THEN** the library opens in list view, sorted by name, filtered to PSN

### Requirement: Library guides users without linked stores
When the user has no linked store that supports importing, the library SHALL say so and point to where stores are linked.

#### Scenario: No linked stores
- **WHEN** a signed-in user with no linked stores opens the library
- **THEN** an empty state explains how to link a store, with a link that opens the GameNode connections page in the system browser

### Requirement: Per-store load failures
When one store's owned games cannot be loaded, the library SHALL keep listing the other stores and mark the failing store in the sidebar with an error and a retry action.

#### Scenario: One store fails
- **WHEN** loading owned Xbox games fails while Steam succeeds
- **THEN** Steam games are listed and the Xbox filter shows an error with a retry action
