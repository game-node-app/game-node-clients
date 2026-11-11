# Spec Delta

## Purpose

Defines how clients render a supporter's profile perks (badge, title, animated avatar border, profile theme and accent color) from the profile read, and how a supporter edits those preferences.

## ADDED Requirements

### Requirement: Perks come from the profile read
Clients SHALL decide which perks to render for a user only from that user's profile read: `isSupporter` and `supporterPreferences`. A perk SHALL render only when `supporterPreferences` is present. Clients SHALL NOT infer supporter status from billing data of another user, from local state, or from a missing field.

#### Scenario: Supporter with default preferences
- **WHEN** a profile read returns `isSupporter: true` and preferences with their defaults
- **THEN** the profile shows the badge, the animated avatar border and the supporter theme in the default accent, no title, and no live indicator

#### Scenario: Lapsed or unknown entitlement
- **WHEN** a profile read returns `supporterPreferences: null`
- **THEN** no supporter perk renders for that user, whatever was stored before

#### Scenario: Server without the new fields
- **WHEN** a profile read has no `isSupporter` or `supporterPreferences` field
- **THEN** the client treats the user as not a supporter and renders no perk, without errors

### Requirement: Supporter badge
When `showBadge` is true, clients SHALL show a "Supporter" badge next to the user's name in the profile header and a compact badge next to the name wherever the shared avatar-with-name element is shown. When `showBadge` is false, no badge SHALL be shown, and the other enabled perks SHALL still render.

#### Scenario: Badge hidden
- **WHEN** a supporter sets `showBadge` to false while the animated border stays on
- **THEN** their profile shows the animated border and no badge, in the header and in lists

#### Scenario: Badge in lists
- **WHEN** a supporter with `showBadge: true` appears in a review, an activity item or a user list
- **THEN** a small static badge appears next to their username, with an accessible label, and no animated border

### Requirement: Supporter title
Clients SHALL show the translated title for a `titleKey` that exists in the client's title catalog, under the username in the profile header. A `null` key or a key missing from the catalog SHALL render nothing. Clients SHALL let supporters choose only keys from the catalog, or no title.

#### Scenario: Known title
- **WHEN** a supporter's preferences return a `titleKey` present in the catalog
- **THEN** the profile header shows its translation in the active language

#### Scenario: Unknown title
- **WHEN** a profile read returns a `titleKey` the client does not know
- **THEN** no title, raw key or placeholder is shown, and the rest of the header renders normally

### Requirement: Animated avatar border
When `showAnimatedAvatarBorder` is true, the profile header avatar SHALL have a ring in the supporter's accent color that animates. When the viewer's system requests reduced motion, the ring SHALL render static. The animated ring SHALL NOT render outside the profile header and the supporter settings preview.

#### Scenario: Reduced motion
- **WHEN** a viewer with `prefers-reduced-motion: reduce` opens a supporter's profile with the border enabled
- **THEN** the ring is shown in the accent color without animation

#### Scenario: Border disabled
- **WHEN** a supporter sets `showAnimatedAvatarBorder` to false
- **THEN** their profile avatar renders exactly as for a non-supporter

### Requirement: Supporter profile theme
When `showSupporterTheme` is true, the supporter's profile header SHALL use their accent color, or the default supporter violet when `accentColor` is null. The theme SHALL change only that profile's header and SHALL NOT change the app palette or other users' screens.

#### Scenario: Custom accent
- **WHEN** a visitor opens the profile of a supporter with the theme on and `accentColor: "#FF8800"`
- **THEN** the profile header shows a strip in that orange under the banner with a "Supporter" label and a tinted info panel, the username keeps its normal color, and the rest of the app keeps its normal colors

#### Scenario: Theme off
- **WHEN** a supporter sets `showSupporterTheme` to false
- **THEN** their profile header uses the normal colors, while the badge, title and border follow their own settings

### Requirement: Readable accent color
Clients SHALL keep accent-colored text at a contrast of at least 4.5:1 and accent decorations at least 3:1 against the surface they sit on, adjusting the displayed shade when the stored color is too dark. The stored value SHALL NOT be changed by this adjustment.

#### Scenario: Very dark accent
- **WHEN** a supporter's `accentColor` is `#101010`
- **THEN** the title and other accent text are drawn in a lightened shade of that color that meets 4.5:1 on the profile background, and the strip's "Supporter" label uses white or near-black, whichever contrasts more with the strip

### Requirement: Editing supporter preferences
Clients SHALL let a signed-in user whose own profile read returns preferences change each of the seven preferences from the supporter settings, send only the changed fields, save each change immediately without a save button, show that the change is saving and then saved, and show the server's resulting values. Users without preferences SHALL NOT see enabled controls.

#### Scenario: Toggle a perk
- **WHEN** a supporter turns off the supporter badge in settings
- **THEN** the client sends `{ "showBadge": false }`, the control and the preview update at once, a "Saved" status appears once the server responds, and the stored result replaces the local value

#### Scenario: Choose an accent color
- **WHEN** a supporter picks a preset or enters a `#RRGGBB` color and confirms
- **THEN** the client sends that value in uppercase `#RRGGBB` form, and "Reset" sends `null`

#### Scenario: Rejected update
- **WHEN** the server responds 400 or a network error occurs
- **THEN** the control returns to its previous value and an error message is shown

#### Scenario: Entitlement ended
- **WHEN** the server responds 403 to a preferences update
- **THEN** the control returns to its previous value, the client refreshes the user's profile and billing status, and the perks controls are replaced by the free view

#### Scenario: Preferences missing for a supporter
- **WHEN** billing status says the user is a supporter but their profile read returns `supporterPreferences: null`
- **THEN** the perks controls are shown disabled with a message and a retry action, and nothing is sent

### Requirement: Live settings preview
The supporter settings SHALL show a non-interactive preview of the user's own profile header that renders the perks with the current control values, including unsaved values while a request is in flight.

#### Scenario: Preview follows controls
- **WHEN** a supporter picks a new accent color
- **THEN** the preview's ring, strip and badge change to that color before the server responds

#### Scenario: Wall status in the preview
- **WHEN** a supporter turns off the supporters wall
- **THEN** the line under the preview changes from "On the supporters wall" to "Not on the supporters wall"

#### Scenario: Example preview for free users
- **WHEN** a user without preferences opens the supporter settings
- **THEN** the preview shows their own profile with the default perks and is captioned as a preview of how it would look
