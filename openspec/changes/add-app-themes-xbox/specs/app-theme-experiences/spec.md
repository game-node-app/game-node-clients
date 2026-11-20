# Spec Delta

## Purpose

Lets a theme change the layout and composition of the apps (an "experience"), not only colors, while the default layout and platform-specific adaptations keep working for everyone else.

## ADDED Requirements

### Requirement: Experiences are independent from palettes
A theme MAY declare one experience; a theme without one SHALL use the default experience. In this change the experiences are `default` and `console`, and only Xbox uses `console`. Switching themes SHALL switch experiences without a reload.

#### Scenario: Default theme layout
- **WHEN** `gamenode` is active
- **THEN** the shell, home and every page render exactly as before this change

#### Scenario: Switch into a console theme
- **WHEN** a user on the home page switches to Xbox
- **THEN** the page re-renders with the console experience without a reload or route change

### Requirement: Experiences load on demand
Code and styles specific to an experience or a theme's screens SHALL be downloaded only when that theme is active. Users who never activate it SHALL NOT download them.

#### Scenario: Default user bundle
- **WHEN** a user on `gamenode` loads the web home page
- **THEN** no console- or Xbox-specific script or stylesheet is requested

#### Scenario: Loading state
- **WHEN** a user activates Xbox and its experience is still loading
- **THEN** the current screen stays usable and switches once loading finishes, without a blank page or error

#### Scenario: Load failure
- **WHEN** the experience fails to load (e.g. offline web user)
- **THEN** the app keeps the default layout with the theme's colors and does not crash

### Requirement: Same data and actions in every experience
Replacement screens SHALL use the same data, permissions, privacy rules, routes and actions as the default screens they replace (e.g. follow, edit profile, add to library, like, report). An experience SHALL NOT expose content the default screen would hide.

#### Scenario: Private library
- **WHEN** a viewer opens a profile whose library is hidden while on Xbox
- **THEN** the Xbox profile hides the same information the default profile hides

#### Scenario: Actions available
- **WHEN** a signed-in user opens a game page on Xbox
- **THEN** they can add/edit/remove the game in their library exactly as on the default game page

### Requirement: Platform adaptations take precedence
When an app replaces a shared component for platform reasons (e.g. mobile Ionic modals, links, list items), that platform replacement SHALL remain in effect under any experience; the experience SHALL adapt its look through styling instead.

#### Scenario: Mobile modal under Xbox
- **WHEN** an Xbox screen on mobile opens a modal
- **THEN** it opens as the native mobile modal, styled with Xbox tokens

### Requirement: Console web shell
Under the `console` experience on web, the shell SHALL show a top header with the logo, the main navigation, search, notifications and the user's profile (avatar, name, level) or a sign-in button. On screens narrower than the desktop breakpoint, navigation SHALL move to a bottom bar that respects safe areas, and page content SHALL not be covered by it. The side navbar SHALL be hidden.

#### Scenario: Desktop header
- **WHEN** a signed-in user on Xbox opens any shell page on a desktop browser
- **THEN** the header shows logo, navigation, search, notifications and their avatar with level

#### Scenario: Narrow web screen
- **WHEN** the viewport is narrower than the desktop breakpoint
- **THEN** navigation is in a fixed bottom bar and the last content of the page remains reachable above it

#### Scenario: Header over hero
- **WHEN** the page is at the top of a console home
- **THEN** the header is see-through over the hero and becomes opaque after scrolling

### Requirement: Console home
Under the `console` experience on web and mobile, the home page SHALL show a hero with the focused game's art (and its trailer after the focus settles, when one exists and reduced motion is off), rows of focusable game tiles (recommendations for signed-in users, playtime/recent games, trending), a trending reviews row, releases, and the blog section. Tiles and rows SHALL be keyboard navigable on web.

#### Scenario: Focus a tile
- **WHEN** a user focuses or hovers a tile in the hero row
- **THEN** the hero shows that game's art and title, and its trailer starts only after the focus has settled

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** no trailer autoplays and tile transitions are not animated

#### Scenario: Signed-out home
- **WHEN** a signed-out user opens the console home
- **THEN** rows that need an account are omitted and the remaining rows render without errors

#### Scenario: Keyboard rows
- **WHEN** a web user presses arrow keys inside a tile row
- **THEN** focus moves between tiles in that row and the row scrolls to keep it visible

### Requirement: Mobile shell under console
On mobile, the `console` experience SHALL keep the native navigation structure (tab bar, side menu, back navigation) and SHALL restyle it with the theme's tokens.

#### Scenario: Mobile tabs on Xbox
- **WHEN** a mobile user is on Xbox
- **THEN** the tab bar and side menu keep their behavior and use Xbox colors
