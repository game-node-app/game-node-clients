# Spec Delta

## Purpose

Show source engagement and the current actor's status while preserving committed reactions and recording navigation impressions safely across retries.

## ADDED Requirements

### Requirement: Engagement reads use native source identities
The client SHALL read counters through `POST /v1/statistics` and actor flags through `GET /v1/statistics/status`, addressing both with `sourceType` and `sourceId`. Game IDs SHALL be positive safe integers and content IDs SHALL retain their UUID strings. The client SHALL NOT require or transmit an internal statistics-row ID.

#### Scenario: Game route initially has no usable identity
- **WHEN** a game route is unresolved or its ID is invalid
- **THEN** the client sends no statistics read or view request for that identity
- **AND** once a valid game ID is available, reads address that numeric game ID

#### Scenario: Comment engagement is displayed
- **WHEN** engagement is requested for a post, review, or activity comment
- **THEN** summary and status requests contain its exact UUID and corresponding comment source type
- **AND** valid zero counters remain zero rather than being treated as missing statistics

### Requirement: Engagement state belongs to the current actor
The client SHALL associate cached actor flags with the current session actor and canonical source identity. Switching actor or authentication state SHALL NOT display the previous actor's flags. Failed reads SHALL retain an error state rather than being presented as successful empty statistics.

#### Scenario: Anonymous visitor signs in
- **WHEN** an anonymous visitor with false engagement flags signs in as an actor who has liked the source
- **THEN** the displayed flags are obtained for that actor instead of reusing the anonymous flags

#### Scenario: Source read fails
- **WHEN** the summary or status request fails for deleted or inaccessible content
- **THEN** the combined engagement read reports failure without inventing a successful summary

### Requirement: Committed reactions preserve responsive counters
Authenticated like toggles SHALL retain the source-only `PUT` or `DELETE /v1/statistics/like` contract. The client SHALL optimistically update `isLiked` and `likesCount`, reconcile those fields with the committed response, and restore previous state on failure. Reconciliation SHALL preserve unrelated summary and status fields.

#### Scenario: Like succeeds with a different committed count
- **WHEN** an optimistic like increments the displayed count and the server returns another committed count
- **THEN** the UI displays the returned `isLiked` and `likesCount`
- **AND** view counters and summary freshness metadata are preserved
- **AND** the request contains only native `sourceId` and `sourceType`

#### Scenario: Unlike fails
- **WHEN** an optimistic unlike request fails
- **THEN** the previous reaction state and count are restored without allowing a negative count

### Requirement: Views represent retry-stable navigation impressions
The client SHALL submit `POST /v1/statistics/view` with only native source identity and a UUID `viewId` bound to one game navigation. Rerenders, repeated effects, and retries of that impression SHALL reuse its identity. A distinct navigation, including returning to the same game, SHALL use a new identity; changing only the game tab SHALL NOT create another impression.

#### Scenario: View acknowledgement is lost
- **WHEN** a navigation view may have committed but its request fails before acknowledgement
- **THEN** any retry for that impression uses the original `viewId` and source binding
- **AND** the client does not mark the failed attempt as accepted

#### Scenario: View is triggered twice while pending
- **WHEN** repeated rendering or effect execution triggers the same navigation before its view request finishes
- **THEN** the client does not create a second impression identity

#### Scenario: Visitor returns to a game
- **WHEN** a visitor navigates from game A to game B and back to game A, or re-enters a retained mobile game page
- **THEN** each navigation has a distinct view identity
- **AND** repeated triggers within any one visit retain that visit's identity

### Requirement: Durable view acceptance is distinct from projected counters
The client SHALL recognize successful view acceptance only from the durable view response. It SHALL refresh the relevant engagement read after acceptance and SHALL NOT invent a synchronous view-counter increment or a projection-completion guarantee. Historical `isViewed` SHALL NOT suppress a distinct navigation impression.

#### Scenario: Accepted view is not projected yet
- **WHEN** a durable view is accepted while the projected view counter is unchanged
- **THEN** the client accepts that response and reads the server-provided counter without adding a fabricated increment
- **AND** a later navigation remains eligible for a new impression even if `isViewed` is true

### Requirement: Client wrapper exposes the replacement statistics API
The public client wrapper SHALL expose source summary/status, series, rankings, durable view, and committed reaction contracts from the backend API. It SHALL remove retired trending and queued-view operations and legacy statistics models/exports without changing unrelated service contracts.

#### Scenario: Consumer uses the generated statistics client
- **WHEN** the wrapper is generated from the updated statistics definitions
- **THEN** its statistics operations target the replacement routes with native source IDs and numeric pagination
- **AND** no supported client call targets `/v1/statistics/trending/*` or `/v1/statistics/queue/*`
