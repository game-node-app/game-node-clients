# Spec Delta

## Purpose

Defines how GameNode Desktop looks: it follows the GameNode design system (Figma "Design System" and "Desktop"
pages) for colors, type, frame, game covers and screen states, so every desktop screen shares one visual base.

## ADDED Requirements

### Requirement: Design-system colors, type and icons
Every desktop screen SHALL use only GameNode design-system values: dark paper surfaces for backgrounds and panels, `#F15025` as the single accent, `#D9D9D9` body text, `#808080` secondary text, Roboto, Mantine spacing and radius steps, and Tabler icons. Default Mantine dark greys SHALL NOT appear as surfaces.

#### Scenario: Surfaces and text
- **WHEN** the library screen is open
- **THEN** the window background, sidebar, top bar and cards use GameNode paper colors, body text is `#D9D9D9`, secondary text is `#808080` and the only accent color is `#F15025`

#### Scenario: Font available offline
- **WHEN** the app starts without network
- **THEN** text still renders in Roboto because the font ships with the app

### Requirement: App frame with top bar
The window SHALL show a top bar with the GameNode logo, a Library nav item marked active, a button opening the application menu, and a user menu opened from the user's avatar. The top bar SHALL occupy the title bar area, be draggable to move the window, and keep the operating system's own minimize, maximize and close controls.

#### Scenario: Application menu stays reachable
- **WHEN** the user clicks the menu button in the top bar
- **THEN** the native application menu opens with the same library actions and shortcuts as before, and those shortcuts keep working without opening it

#### Scenario: Move and control the window
- **WHEN** the user drags an empty part of the top bar, then clicks the OS close control
- **THEN** the window moves with the drag, and the close control behaves as on any native window

#### Scenario: User menu
- **WHEN** the user opens the avatar menu
- **THEN** it shows their username and "Sign out"

### Requirement: Game covers keep their proportions
Game covers SHALL be shown at the GameNode cover ratio (264:354), filling their frame by cropping, never by stretching or letterboxing. The app SHALL request an IGDB cover size large enough for the displayed size on the current screen density. Games without a cover SHALL show the GameNode placeholder cover.

#### Scenario: Grid cover
- **WHEN** a game with an IGDB cover appears in the grid on a 150% scaled display
- **THEN** its cover is sharp, keeps the 264:354 ratio and is not distorted

#### Scenario: Missing cover
- **WHEN** a game has no cover
- **THEN** its card shows the GameNode placeholder cover at the same size as other cards

### Requirement: Game card states
Grid cards SHALL show the cover, the game name (one line, truncated) and the game source. Hover SHALL lighten the card, selection SHALL outline the cover in the accent color, and keyboard focus SHALL show a visible focus ring.

#### Scenario: Selected
- **WHEN** the user selects a game
- **THEN** its cover is outlined in `#F15025`

### Requirement: Library sidebar follows the design system
The library filter sidebar SHALL follow the design-system expanded sidebar: uppercase dimmed section labels ("Library", "Sources"), one menu item per filter with its count right-aligned, and the active item highlighted on a raised paper surface.

#### Scenario: Active filter
- **WHEN** the user picks the Steam filter
- **THEN** the Steam item is highlighted, its count stays visible and the other items return to their default style

### Requirement: Screen states follow the design system
Loading, empty, error and offline states SHALL be centered on the content area with a Tabler icon, a short title, dimmed explanation and at most one primary action button. Errors SHALL use the design-system danger style, and the offline notice SHALL be a single slim bar under the top bar.

#### Scenario: Empty library
- **WHEN** a signed-in user opens the library and no game has been found
- **THEN** the content area shows an icon, a title and a dimmed explanation that installed games will appear here

#### Scenario: Offline
- **WHEN** the device goes offline while the library is open
- **THEN** a slim bar under the top bar says the app is offline, and no other layout shifts

### Requirement: Sign-in screen follows the design system
The sign-in screen SHALL show the GameNode logo, a heading, a dimmed explanation and one full-width button per provider with the provider's icon, centered on a paper card over the app background. Errors SHALL appear inside the card above the buttons.

#### Scenario: Sign-in screen
- **WHEN** a signed-out user opens the app
- **THEN** they see the logo, heading, explanation and one button per provider with its icon, styled per the design system

### Requirement: Buttons and inputs follow the design system
Primary actions SHALL use the filled accent button, secondary actions the design-system secondary or outline button, and toggles such as grid/list SHALL use the design-system tag-filter style (filled accent when active). Text inputs SHALL use the design-system input style with an accent border on focus.

#### Scenario: View toggle
- **WHEN** the library is in grid view
- **THEN** the Grid toggle is filled with the accent color and the List toggle uses the default tag-filter style
