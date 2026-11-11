# Spec Delta

## Purpose

Defines how clients show what a supporter is playing right now on their profile, using the public presence endpoint, and how often they may ask for it.

## ADDED Requirements

### Requirement: Playing now indicator
The profile header SHALL show a "Playing now" indicator with the game name when `GET /v1/profile/:id/presence` returns a non-null `playing`. When `gameId` is present, the indicator SHALL link to that game's page; when it is null, it SHALL show the Steam name without a link. When `playing` is null, nothing SHALL be shown.

#### Scenario: Game in the catalog
- **WHEN** presence returns `{ "playing": { "source": "steam", "name": "Hades", "gameId": 12345 } }`
- **THEN** the header shows "Playing now · Hades" with a Steam icon, linking to the game page for id 12345

#### Scenario: Game not in the catalog
- **WHEN** presence returns a `playing` object with `gameId: null`
- **THEN** the header shows the Steam game name as plain text

#### Scenario: Not playing
- **WHEN** presence returns `{ "playing": null }` or the request fails
- **THEN** no indicator, placeholder or error is shown

### Requirement: Presence request gating
Clients SHALL request presence only from a profile header whose profile read has `supporterPreferences.showLiveProfile` set to true, and only while that profile screen is the visible screen and the app or tab is in the foreground. Clients SHALL NOT request presence for list items, previews or background screens.

#### Scenario: Live profile off
- **WHEN** a visitor opens a profile whose preferences have `showLiveProfile: false`, or no preferences
- **THEN** no presence request is made

#### Scenario: Profile not visible
- **WHEN** the user navigates from a live profile to another screen that keeps the profile mounted in the background, or hides the browser tab
- **THEN** presence requests stop until the profile is visible again

#### Scenario: Lists
- **WHEN** a supporter with live profile on appears in a list, a review or the supporters wall
- **THEN** no presence request is made for them

### Requirement: Presence polling interval
While gating allows it, clients SHALL refresh presence no more often than once every 60 seconds per profile.

#### Scenario: Profile stays open
- **WHEN** a visitor keeps a live profile open for five minutes
- **THEN** the client makes at most one presence request per 60-second window

#### Scenario: Owner turns live profile off
- **WHEN** a supporter disables live profile in settings and then opens their own profile
- **THEN** the client does not request presence, and any indicator shown before disappears
