## ADDED Requirements

### Requirement: Ruins theme palette
The system SHALL register a `ruins` theme with `colorScheme: "light"`, radius 0 and the Figma Ruins tokens, selectable by verified Supporters on web and mobile.

#### Scenario: Supporter selects Ruins
- **WHEN** a Supporter selects Ruins in Settings → Appearance
- **THEN** the app switches to the Ruins palette and fonts without reloading, and the choice persists across reloads on that device

#### Scenario: Non-supporter
- **WHEN** an account without Supporter access opens Appearance
- **THEN** Ruins is shown locked and cannot be applied

### Requirement: Theme-driven color scheme
The system SHALL set Mantine's color scheme from the active theme's `colorScheme`, on first paint and on every theme change, while `gamenode` and `xbox` keep rendering exactly as before.

#### Scenario: Switching between light and dark themes
- **WHEN** the user switches from Ruins to GameNode
- **THEN** the document uses the dark scheme and GameNode colors with no Ruins styling left behind

### Requirement: Ruins styling
While Ruins is active the system SHALL render the Ruins motifs: square corners, inverted selection bars with a hard 4px shadow, square markers, uppercase tracked headings, mono metadata, ruled section headers, sepia covers and window-bar dialogs, with readable text on every themed surface.

#### Scenario: Navigation selection
- **WHEN** a navigation item is active
- **THEN** it renders as an accent bar with accent-contrast text and a hard offset shadow

### Requirement: Ruins options
While Ruins is active, Appearance SHALL show Boot animation (Always / Once a day / Never), Paper texture (on/off) and Scanline (on/off), stored per device and applied immediately. The options SHALL be hidden for other themes.

#### Scenario: Disable paper texture
- **WHEN** the user turns Paper texture off
- **THEN** the grain and grid disappear immediately and stay off after reload

### Requirement: Boot sequence
When Ruins is active and the Boot animation option allows it, the system SHALL show the boot sequence once per cold start (mobile) or app load (web), using only cached data, never blocking on the network, skippable by tap, click, Esc or Enter, honoring reduced motion and announcing only "GameNode loaded" to assistive technology.

#### Scenario: Once a day
- **WHEN** the option is "Once a day" and the sequence already ran today
- **THEN** reloading the app does not show it again

#### Scenario: Reduced motion
- **WHEN** the system requests reduced motion
- **THEN** the log is skipped and the static lockup shows for 400 ms
