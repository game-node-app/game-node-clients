# Spec Delta

## Purpose

Decide who can enter the Adventurers Guild in the clients, following the server rollout gate so the feature can move from supporter early access to public access without a client release.

## ADDED Requirements

### Requirement: Server-driven access decision
The Guild screen SHALL call `GET /v1/guild/access` before requesting any other Guild endpoint and SHALL render the Guild Hall only when the response has `hasAccess: true`. The client SHALL NOT hard-code the access mode or derive access from local supporter state. The access read SHALL be refreshed when the screen regains focus after being hidden for more than five minutes.

#### Scenario: Supporter in supporters mode
- **WHEN** a signed-in active supporter opens `/guild` and `/v1/guild/access` returns `{ "mode": "supporters", "hasAccess": true }`
- **THEN** the Guild Hall renders and the overview and board are requested

#### Scenario: Public mode
- **WHEN** a signed-in free user opens `/guild` and the access response is `{ "mode": "public", "hasAccess": true }`
- **THEN** the Guild Hall renders exactly as for a supporter, with no early-access messaging

### Requirement: Guest and early-access screens
When `hasAccess` is false, the client SHALL NOT call any other Guild endpoint. A guest SHALL see a sign-in call to action. A signed-in user SHALL see an early-access screen, in the Guild's pixel-art style with Lina, explaining that the Guild is in early access for supporters and linking to the app's supporter offer (web `/premium`, mobile `/preferences/supporter`).

#### Scenario: Guest
- **WHEN** a visitor without a session opens `/guild`
- **THEN** a sign-in call to action is shown and no request other than `/v1/guild/access` is made to `/v1/guild*`

#### Scenario: Free user during early access
- **WHEN** a signed-in non-supporter opens `/guild` and the access response is `{ "mode": "supporters", "hasAccess": false }`
- **THEN** the early-access screen is shown with a button that opens the supporter offer

### Requirement: Blocked response recovery
If any player Guild request returns HTTP 403 with `code: "guild_early_access_required"`, the client SHALL switch to the early-access screen and re-read `/v1/guild/access` once, without retrying the failed request in a loop and without showing a generic error notification for it.

#### Scenario: Supporter lapses mid-session
- **WHEN** the board request returns 403 `guild_early_access_required`
- **THEN** the early-access screen replaces the Guild Hall and `/v1/guild/access` is requested again exactly once

### Requirement: Guild navigation entry
The web dock and the mobile sidebar SHALL contain a "Guild" entry linking to `/guild`, visible to every visitor, carrying an "Early access" badge while the access mode is `supporters`.

#### Scenario: Entry during early access
- **WHEN** `/v1/guild/access` reports `mode: "supporters"`
- **THEN** the Guild entry shows the early-access badge

#### Scenario: Entry after public launch
- **WHEN** `/v1/guild/access` reports `mode: "public"`
- **THEN** the Guild entry is shown without the early-access badge
