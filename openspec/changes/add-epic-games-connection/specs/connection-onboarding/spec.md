# Spec Delta

## Purpose

Lets users link, relink and configure their gaming platform accounts from the web and mobile apps, using the onboarding flow that matches each provider's declared auth mode, and presents each linked provider consistently across the apps.

## ADDED Requirements

### Requirement: Onboarding flow follows the provider's auth mode
The connection setup UI SHALL choose the onboarding flow from the provider's `authMode` returned by `GET /v1/connections`: `redirect` navigates to the provider and returns through the callback route, `public_identifier` asks for an account identifier, and `delegated_code` runs the paste-code flow. A provider with an unknown auth mode SHALL show the "not supported yet" message.

#### Scenario: Epic Games uses the paste-code flow
- **WHEN** a user opens connection setup for `epicgames`, which the server reports with `authMode: "delegated_code"`
- **THEN** the setup shows the two-step paste-code flow and no identifier field and no redirect

#### Scenario: Existing providers are unchanged
- **WHEN** a user opens connection setup for `steam`, `xbox` or `psn`
- **THEN** the setup behaves as before this change

### Requirement: Delegated-code sign-in step
For a `delegated_code` provider, the user SHALL choose auto-import settings before continuing. Continuing SHALL call `POST /v1/connections/:type/auth/init` with those settings and keep the returned `state` in the open setup. The user SHALL then be able to open the returned sign-in URL outside the current page: a new browser tab on web, the in-app browser on native mobile. The GameNode page SHALL stay open.

#### Scenario: Starting Epic sign-in on web
- **WHEN** a user enables auto-import into a collection, continues, and then selects "Open Epic Games sign-in"
- **THEN** init is called once with that auto-import setting, the Epic login URL opens in a new tab, and the setup stays open on the paste-code step

#### Scenario: Starting Epic sign-in on native mobile
- **WHEN** the same steps happen in the native mobile app
- **THEN** the Epic login URL opens in the in-app browser and the setup is still on the paste-code step when the user returns

### Requirement: Pasting the delegated code
The paste-code step SHALL accept either the raw authorization code or the whole JSON page that Epic displays, and SHALL submit the trimmed text unchanged as `callbackParams.code` to `POST /v1/connections/:type/auth/callback`, along with the `state` from init. The server extracts the code. Input that contains no 32-character hexadecimal code SHALL show an inline error and send nothing, because a failed callback uses up the single-use `state`.

#### Scenario: Pasting the raw code
- **WHEN** the user pastes ` 0123456789abcdef0123456789abcdef ` and submits
- **THEN** the callback is sent with `callbackParams.code` set to `0123456789abcdef0123456789abcdef` and the `state` from init

#### Scenario: Pasting the whole Epic page
- **WHEN** the user pastes `{"redirectUrl":"…","authorizationCode":"0123456789abcdef0123456789abcdef","sid":null}` and submits
- **THEN** the callback is sent with that text as `callbackParams.code`

#### Scenario: Input without a code
- **WHEN** the user pastes `{"sid":null}` or an empty value and submits
- **THEN** an inline error asks for the code and no request is sent

### Requirement: Delegated-code completion and failure
When the callback succeeds, the client SHALL refresh the connection data, show a success notification naming the provider, and close the setup. When the callback fails, the setup SHALL stay open, show the server's error inline, and offer "Start over", which goes back to the first step and discards the old `state`. The client SHALL NOT reuse a `state` after a failed callback.

#### Scenario: Successful link
- **WHEN** the callback returns success
- **THEN** the connections list shows the Epic display name with status "Connected", and a success notification names "Epic Games"

#### Scenario: Expired or rejected code
- **WHEN** the callback responds HTTP 400 because the state expired or Epic rejected the code
- **THEN** the error appears inline, and "Start over" returns to the settings step so that a new init is required before another submission

### Requirement: Reconnecting a delegated-code connection
A connected `delegated_code` provider SHALL offer the existing settings form and a "Reconnect" action. Reconnect SHALL run the same paste-code flow with the current auto-import settings. A connection with `authStatus: "reauth_required"` SHALL be relinked through this flow.

#### Scenario: Epic connection needs reauthorization
- **WHEN** a user's Epic connection is `reauth_required` and the user selects "Reconnect"
- **THEN** the paste-code flow starts, and after a successful callback the connection shows "Connected"

### Requirement: Epic Games presentation
Wherever the apps name, picture or link a connection, `epicgames` SHALL appear as "Epic Games" with the server-stored `epicgames` icon. The mobile connections list SHALL include Epic Games. The importer SHALL accept `epicgames` as a source at `/importer/epicgames` and name it "Epic Games".

#### Scenario: Mobile connections list
- **WHEN** a user opens connections in the mobile app
- **THEN** Epic Games is listed with its icon and status, alongside Steam, PlayStation Network and Xbox

#### Scenario: Importing from Epic
- **WHEN** a user with a connected Epic account opens `/importer/epicgames`
- **THEN** the importer lists the unprocessed Epic games and refers to the source as "Epic Games"
