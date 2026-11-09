# Spec Delta

## Purpose

Defines which cover each client surface requests and shows, how personalized game data is kept separate between viewers, owners and display modes, and how clients recover when a chosen cover's image is unavailable.

## ADDED Requirements

### Requirement: Viewer personalization on surfaces without another owner
Game reads that request the cover relation on the viewer's own content, on game pages and on surfaces without an owner SHALL opt in with `personalizeCovers: true`.

#### Scenario: Game page for a signed-in viewer
- **WHEN** a signed-in viewer with mode `any` opens a game page
- **THEN** the game read sends `personalizeCovers: true` and `relations.cover`

#### Scenario: Viewer's own library
- **WHEN** a signed-in viewer opens their own library
- **THEN** the game read sends `personalizeCovers: true` and does not send `coverOwnerUserId`

### Requirement: Owner personalization on another user's content
Game reads for another user's library, favorites, collections, profile, collection entries, journal, playtime or reviews SHALL send `coverOwnerUserId` with that user's id and SHALL NOT send the viewer's id as the owner.

#### Scenario: Another user's library
- **WHEN** a viewer opens the library of user B
- **THEN** the game read sends `coverOwnerUserId` with B's id

#### Scenario: Anonymous visitor on a profile
- **WHEN** a signed-out visitor opens the favorites of user B
- **THEN** the game read sends `coverOwnerUserId` with B's id

#### Scenario: Owner not yet known
- **WHEN** the owner of the content is still loading
- **THEN** the surface shows the default cover until the owner is known

### Requirement: Requests skip personalization when the result is the default
A game read SHALL NOT send opt-in fields when the cover relation is absent, when the viewer's mode is `none`, or for an anonymous viewer without an owner.

#### Scenario: Cover relation not requested
- **WHEN** a game read does not request `relations.cover`
- **THEN** no opt-in field is sent

#### Scenario: Viewer mode none
- **WHEN** a signed-in viewer with mode `none` opens another user's library
- **THEN** no opt-in field is sent and default covers are shown

#### Scenario: Anonymous game page
- **WHEN** a signed-out visitor opens a game page
- **THEN** no opt-in field is sent

### Requirement: Default covers while the viewer is being resolved
Until the session and, for signed-in viewers, the display mode are known, game reads SHALL be sent without opt-in fields. Once known, personalized covers SHALL replace the defaults without a loading state.

#### Scenario: First paint for a signed-in viewer
- **WHEN** a game page renders before the session is resolved
- **THEN** the default cover is visible and is replaced after the personalized read completes, with no loading indicator in between

#### Scenario: Profile unavailable
- **WHEN** the viewer's profile cannot be loaded
- **THEN** default covers remain visible

### Requirement: Surfaces that always show the default cover
Admin screens, Daily, recap and wrapped surfaces SHALL NOT send opt-in fields.

#### Scenario: Admin
- **WHEN** an admin screen reads a game with its cover
- **THEN** no opt-in field is sent

#### Scenario: Daily
- **WHEN** the Daily page reads guessed or answer games
- **THEN** no opt-in field is sent

#### Scenario: Recap
- **WHEN** a recap card reads a game with its cover
- **THEN** no opt-in field is sent

### Requirement: Surfaces that do not display a cover
A surface that requests game data but does not display its cover SHALL NOT send opt-in fields.

#### Scenario: Activity feed item
- **WHEN** an activity feed item reads its game to show the game's name
- **THEN** no opt-in field is sent

### Requirement: Server-side reads stay unpersonalized
Server-side prefetches SHALL NOT send opt-in fields, and SHALL keep hydrating the client's default game query.

#### Scenario: Web game page SSR
- **WHEN** the web game page is rendered on the server
- **THEN** the response contains the default cover and the client reuses the prefetched data on first render

### Requirement: Search results are not personalized
Search requests SHALL NOT include opt-in fields, and search results SHALL show the default cover they return.

#### Scenario: Search results
- **WHEN** a viewer with a stored choice searches for that game
- **THEN** the result shows the default cover

### Requirement: Personalized data isolation
Personalized game data SHALL be cached separately per viewer, opt-in form, owner and display mode, and MUST NOT be reused across any of them.

#### Scenario: Different owners
- **WHEN** a viewer opens user A's library and then user B's library containing the same game
- **THEN** each library shows the cover resolved for its own owner

#### Scenario: Unpersonalized reads unaffected
- **WHEN** a game read sends no opt-in field
- **THEN** it shares its cached data with other unpersonalized reads of the same game and relations

### Requirement: Cover refresh after a choice changes
After a choice is stored or removed, every loaded surface that can contain that game SHALL show the updated cover without a reload.

#### Scenario: Own library updates
- **WHEN** a user changes a game's cover and returns to a loaded library containing that game
- **THEN** the library shows the new cover

### Requirement: Cover refresh after identity changes
When the signed-in viewer changes, covers SHALL be resolved for the new viewer and data of the previous viewer MUST NOT be shown.

#### Scenario: Sign-out
- **WHEN** a viewer signs out on a loaded game page
- **THEN** the page no longer shows that viewer's chosen cover

#### Scenario: Sign-in
- **WHEN** a visitor signs in
- **THEN** covers are resolved using the new viewer's choices and mode

### Requirement: No auth retry on game repository reads
Opted-in game repository reads SHALL NOT trigger sign-in redirects or session retries.

#### Scenario: Expired session on a personalized read
- **WHEN** a personalized read is sent with an expired session and the server treats it as anonymous
- **THEN** the response is shown normally and no authentication flow starts

### Requirement: Image failure fallback
When a game's cover image fails to load, the client SHALL fall back to the game's default cover once and SHALL NOT retry the failed URL. If the default is unavailable or has failed as well, the placeholder image SHALL be shown.

#### Scenario: Chosen cover removed from IGDB
- **WHEN** a personalized cover URL fails to load
- **THEN** the default cover is shown in its place

#### Scenario: Default cover also fails
- **WHEN** the default cover fails to load after the fallback
- **THEN** the placeholder image is shown and no further load is attempted

#### Scenario: Cover changes after a failure
- **WHEN** a failed surface later receives a different cover URL
- **THEN** the new URL is attempted
