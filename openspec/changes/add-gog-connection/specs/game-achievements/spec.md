# Spec Delta

## Purpose

Presents external-store achievement catalogues and persisted player progress without inventing provider metadata or treating failed retrieval as authoritative absence.

## ADDED Requirements

### Requirement: GOG achievement identity and presentation
The client SHALL display existing achievement reads for `source: 5` using `sourceName: "GOG"`, `sourceAbbreviatedName: "GOG"`, `iconName: "gog"` and `platformIds: [6]`. Definitions and obtained progress SHALL join by equal `externalId` within the source; GOG's `achievement_id` SHALL remain an opaque identity.

#### Scenario: GOG catalogue and obtained match
- **WHEN** a GOG definition and obtained record share `externalId: "achievement_id_value"` and source `5`
- **THEN** the GOG PC achievement shows the returned obtained state/date through the existing game and collection views
- **AND** another source with the same external ID does not grant GOG progress

#### Scenario: GOG group presentation
- **WHEN** the game achievement reads return a GOG group
- **THEN** web and mobile show the GOG tab, icon, PC achievements and a count-based completion summary without requiring a new endpoint

### Requirement: Preserve GOG hidden text and provider metadata
GOG achievements SHALL preserve empty hidden names/descriptions and absent optional dates. The UI SHALL NOT invent titles, descriptions, platinum trophies, trophy tiers, gamerscore or rarity metadata absent from the returned GOG data.

#### Scenario: Hidden GOG definition
- **WHEN** the GOG definition has an empty name/description and no Steam, PSN or Xbox details
- **THEN** rendering succeeds without a guessed title/description or provider-specific trophy, gamerscore or rarity decoration

#### Scenario: Completed GOG group
- **WHEN** every returned GOG achievement is obtained
- **THEN** completion is represented by the achievement count and progress, without awarding or implying a platinum trophy

#### Scenario: Missing obtained date
- **WHEN** an obtained GOG achievement has `obtainedAt: null`
- **THEN** the UI retains its obtained status without inventing an unlock date

### Requirement: Server-controlled achievement refresh authority
The client SHALL use existing catalogue and obtained-read endpoints. Owner obtained reads can enqueue refresh; other-user/public reads SHALL expose persisted progress without client attempts to gain refresh authority. Catalogue retrieval requiring a usable connected account on the server SHALL remain an availability condition, not proof of no achievements.

#### Scenario: Owner views their GOG progress
- **WHEN** the authenticated owner opens their achievement progress
- **THEN** existing owner reads are used and the server decides whether to enqueue refresh

#### Scenario: Another player or public viewer
- **WHEN** a viewer reads another player's persisted GOG achievements
- **THEN** the viewed user's identity is retained, the viewer receives no refresh controls or owner impersonation requests, and the client does not require the viewer to link GOG to gain refresh authority

#### Scenario: Catalogue lacks a usable server account
- **WHEN** catalogue retrieval reports that no usable connected GOG account is available
- **THEN** the client shows unavailable/error state that can be retried instead of confirming that the game has no achievements

### Requirement: Recoverable achievement failures
Provider failures, truncated snapshots and failed progress reads SHALL remain retryable/unavailable. Game overviews, achievement lists, collection trackers and progress-sharing UI SHALL NOT translate those failures into empty catalogues, zero progress, "no obtained achievements" or completed progress. A failed refresh SHALL NOT erase persisted progress.

#### Scenario: Initial catalogue or progress failure
- **WHEN** either existing achievement read fails or the server reports an incomplete snapshot
- **THEN** the affected view indicates unavailable/error state with a retry path and does not render a confirmed absence or fabricated locked progress

#### Scenario: Failed refresh after prior success
- **WHEN** previously loaded GOG progress exists and a subsequent read fails
- **THEN** prior progress is retained as previously loaded information and the failed refresh remains distinguishable from a successful fresh result

#### Scenario: Successful empty obtained read
- **WHEN** a complete successful obtained read contains no records for the viewed user
- **THEN** the existing empty-progress behavior remains valid and is distinct from a failed read
