# Spec Delta

## Purpose

Lets GameNode users switch the look of the web and mobile apps between registered themes, with every app surface, shared component and native chrome following one token set per theme.

## ADDED Requirements

### Requirement: Theme catalog
The system SHALL offer a fixed catalog of themes. In this change the catalog is `gamenode` (default) and `xbox`. Each theme SHALL define every semantic token (background, surfaces, text, muted text, border, accent, accent contrast, focus, success, warning, danger), a radius and a font, and SHALL have a translated label and a preview palette derived from its tokens.

#### Scenario: Default theme
- **WHEN** a user who never chose a theme opens web or mobile
- **THEN** the `gamenode` theme is active and the app looks as it did before this change

#### Scenario: Incomplete theme rejected
- **WHEN** a theme definition omits a required token or its text/background or accent/accent-contrast pairs fall below WCAG AA contrast (4.5:1 for body text, 3:1 for large text and UI)
- **THEN** the automated checks fail before the theme can ship

### Requirement: Themes apply to every styling layer
The active theme's tokens SHALL drive colors, radius and fonts in Mantine components, Ionic components (including toolbars, tab bars and `ion-color` variants) and Tailwind utilities for brand, paper, line, nav, dimmed and body colors, on web and mobile.

#### Scenario: Accent follows the theme
- **WHEN** the Xbox theme is active
- **THEN** primary buttons, brand badges, links styled as brand, the Ionic primary color and `brand-*` utilities render Xbox green instead of GameNode orange

#### Scenario: Surfaces follow the theme
- **WHEN** the theme changes
- **THEN** page background, cards (`paper-*`), borders and dimmed text change to that theme's values without a reload

### Requirement: No hard-coded colors in shared and app UI
New code in `@repo/ui`, web and mobile SHALL NOT introduce color literals in components or styles; lint SHALL report them. Explicit exemptions SHALL be limited to content art (game art, recap/awards artwork, platform brand marks) and SHALL be marked in code.

#### Scenario: Literal introduced
- **WHEN** a contributor adds `c="#F15025"` or `bg-[#1a1a1a]` to a component
- **THEN** `pnpm lint` reports an error pointing to a token to use instead

#### Scenario: Exempt artwork
- **WHEN** a recap card gradient is marked as theme-exempt artwork
- **THEN** lint accepts it and the color stays fixed across themes

### Requirement: Theme selection in Appearance settings
The Appearance tab of the settings SHALL let the user select available themes on web and mobile. Selecting a theme SHALL apply it immediately. Themes not yet available (other store themes, Light, System) SHALL be shown as disabled. The non-affiliation disclaimer SHALL remain visible under store-inspired themes.

#### Scenario: Switch to Xbox
- **WHEN** a user picks Xbox in Appearance
- **THEN** the whole app switches to the Xbox theme immediately and the Xbox option shows as current

#### Scenario: Back to default
- **WHEN** a user on Xbox picks Dark (GameNode)
- **THEN** the `gamenode` theme is restored

#### Scenario: Unavailable themes
- **WHEN** the Appearance tab is open
- **THEN** PlayStation, Nintendo, Steam, Light and System are visible but cannot be selected

### Requirement: Per-device persistence
The chosen theme SHALL persist on the device (browser or app install) across reloads and restarts and SHALL NOT be stored on the server. An unknown or invalid stored value SHALL fall back to `gamenode`.

#### Scenario: Reload keeps the theme
- **WHEN** a user selects Xbox and reloads the web page or restarts the mobile app
- **THEN** Xbox is still active

#### Scenario: Other device unaffected
- **WHEN** the same account signs in on another browser or device
- **THEN** that device uses its own stored theme (or the default)

#### Scenario: Removed theme stored
- **WHEN** the stored value names a theme that no longer exists
- **THEN** the app uses `gamenode` without errors

### Requirement: No flash of the wrong theme
The stored theme SHALL be applied before the first paint on web (including server-rendered HTML when the preference is available to the server) and before the first render on mobile.

#### Scenario: Web SSR
- **WHEN** a web user with Xbox stored requests any server-rendered page
- **THEN** the initial HTML already carries the Xbox theme and no GameNode-orange frame is shown

#### Scenario: Mobile cold start
- **WHEN** the mobile app starts with Xbox stored
- **THEN** the first rendered screen uses the Xbox theme

### Requirement: Native and browser chrome follow the theme
On mobile, the status bar style and the Android edge-to-edge background SHALL use the active theme's colors and SHALL update when the theme changes. On web, the browser `theme-color` SHALL match the active theme.

#### Scenario: Android switch
- **WHEN** an Android user switches to Xbox
- **THEN** the system bar background changes to the Xbox background without restarting the app

#### Scenario: Web address bar
- **WHEN** a mobile-browser user is on Xbox
- **THEN** the browser UI tint matches the Xbox background

### Requirement: Admin stays on the default theme
The admin app SHALL always render the `gamenode` theme and SHALL NOT expose a theme picker.

#### Scenario: Admin with web preference
- **WHEN** an admin who uses Xbox on the web app opens the admin app
- **THEN** admin renders in the default theme
