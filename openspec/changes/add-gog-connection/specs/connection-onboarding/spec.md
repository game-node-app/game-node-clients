# Spec Delta

## Purpose

Lets players link and reconnect gaming accounts using each provider's advertised authentication flow, with consistent identity presentation and protected authorization inputs across web and mobile.

## ADDED Requirements

### Requirement: Additive GOG provider support
The client API SHALL accept `gog` in connection, importer and notification-provider contracts while preserving existing values. The UI SHALL use the server's `authMode` and capability flags for GOG rather than manual identifier linking.

#### Scenario: Available GOG provider
- **WHEN** `GET /v1/connections` returns `type: "gog"`, `name: "gog"`, `iconName: "gog"`, `authMode: "delegated_code"` and all four import/watch/playtime/achievement capability flags true
- **THEN** GOG uses delegated sign-in and supports the advertised actions without a username field or manual `POST /v1/connections` linking request

#### Scenario: Existing provider compatibility
- **WHEN** Steam, PSN, Xbox, Epic Games or Nintendo is selected
- **THEN** its existing authentication, import and notification behavior is preserved

### Requirement: GOG presentation and safe links
The clients SHALL display `gog` as "GOG" with the existing `/v1/public/icons/gog.png` asset. Web and mobile connections, profiles, import source selectors and notifications SHALL support it. Clients SHALL NOT derive profile or store URLs from numeric GOG account or product IDs.

#### Scenario: Connection list and profile
- **WHEN** a GOG connection appears in preferences or on a profile
- **THEN** its GOG icon and identity render without an unsupported-provider failure
- **AND** the profile icon has no fabricated external profile link

### Requirement: GOG delegated sign-in initialization
Starting or reconnecting GOG SHALL send an authenticated `POST /v1/connections/gog/auth/init` with `{}` or existing auto-import preferences, retaining both returned `state` and `authorizationUrl` for the current attempt. Sign-in SHALL open that URL in a browser while the setup remains available for pasting.

#### Scenario: Init with collection preferences
- **WHEN** a player enables automatic import to their collection and continues
- **THEN** init receives `isAutoImportEnabled` and `autoImportCollectionId`, and sign-in opens the returned URL without discarding the returned GameNode state

#### Scenario: Mobile or another browser
- **WHEN** the player starts GOG setup on mobile
- **THEN** instructions explain copying the full final URL through the browser address/share control, returning to the app and pasting it
- **AND** the authorization URL can be copied for completing sign-in in a desktop browser within the same attempt
- **AND** if the app loses the attempt, the player starts init again

### Requirement: GOG animated sign-in guide
The GOG sign-in step SHALL show an animated guide on web and mobile following Nintendo's pattern, using fictitious values only. It SHALL include English/Brazilian Portuguese alternative text and play/pause controls, respect reduced motion with a static fallback, and supplement mobile address/share instructions.

#### Scenario: Viewing and pausing the guide
- **WHEN** the player opens GOG sign-in without requesting reduced motion
- **THEN** the GOG guide animates before the sign-in button and can be paused to a static image and played again
- **AND** it demonstrates sign-in, copying the entire final browser URL and returning to GameNode to paste and submit it
- **AND** Nintendo keeps its own guide and other providers do not show the GOG guide

#### Scenario: Reduced motion
- **WHEN** the player opens GOG sign-in with reduced motion enabled
- **THEN** the guide starts with the static image and offers an explicit play control

### Requirement: Full GOG final URL submission
The GOG paste step SHALL accept the full HTTPS `embed.gog.com/on_login_success` URL with `origin=client` and a nonempty `code`. It SHALL send the trimmed original text as `callbackParams.code` with init's GameNode `state` to `POST /v1/connections/gog/auth/callback`. It SHALL NOT extract just the code, fetch the pasted URL or request access/refresh tokens.

#### Scenario: Valid final URL
- **WHEN** init returned `game-node-state` and the player submits ` https://embed.gog.com/on_login_success?origin=client&code=one-use-code&extra=value `
- **THEN** the callback body contains `state: "game-node-state"` and `callbackParams.code: "https://embed.gog.com/on_login_success?origin=client&code=one-use-code&extra=value"`
- **AND** there is no request to the pasted URL and no expectation that it contains the GameNode state

#### Scenario: Obvious invalid input
- **WHEN** the player submits a bare code, token, malformed URL, different host, non-HTTPS URL, wrong path, wrong/missing origin or empty/missing code
- **THEN** an inline localized error asks for the full final GOG URL and no callback is sent
- **AND** the local check imposes no Epic hexadecimal-code or Nintendo-link validation on GOG

### Requirement: GOG completion and single-use recovery
Successful callback SHALL refresh connection data, show GOG success and close setup using the safe connection DTO. The client SHALL NOT retry a callback automatically or reuse state after any failed exchange. Failure SHALL offer fresh init; instructions SHALL explain that state expires after ten minutes and is single use.

#### Scenario: Safe successful connection
- **WHEN** callback returns a safe DTO with `type: "gog"`, display identity, preferences, capabilities and `authStatus: "connected"`
- **THEN** the client presents the connected account without expecting or requesting credentials in the response

#### Scenario: Expired state or failed exchange
- **WHEN** callback fails, including expiry, rejection or an uncertain network outcome
- **THEN** another submission with the old state is blocked, and Start over discards the attempt and requires init before resubmission

### Requirement: GOG authorization input privacy
The pasted URL and one-use code SHALL be excluded from logs, analytics, session recordings and crash reports, including error payloads. The attempt SHALL remain transient and SHALL NOT be written to persistent client storage or navigation URLs. English and Brazilian Portuguese instructions and errors SHALL use placeholders rather than real authorization values.

#### Scenario: Pasting and failed callback under telemetry
- **WHEN** a player pastes a final GOG URL and callback succeeds or fails
- **THEN** captured events, recordings and reported/logged errors contain neither that URL nor its code
- **AND** the URL is sent only in the authenticated callback request, not as telemetry or a client route

### Requirement: GOG reconnect and existing settings behavior
GOG `authStatus: "reauth_required"` SHALL offer the existing reconnect flow using fresh init/callback. GOG settings and deletion SHALL keep existing endpoints and collection ownership rules. The client SHALL rely on the server to resume eligible synchronization after reconnect.

#### Scenario: Reconnect notification
- **WHEN** a `connection.reauth-required` notification targets a connection with `provider: "gog"`
- **THEN** it displays GOG and its icon and navigates to `/preferences/connections`
- **AND** Reconnect uses current auto-import preferences and fresh init/callback, then displays the returned connected status

#### Scenario: Saving or deleting a GOG connection
- **WHEN** the owner updates preferences or deletes GOG
- **THEN** the existing settings/delete APIs are used, server ownership errors remain visible and no manual relinking or client-triggered sync loop is introduced
