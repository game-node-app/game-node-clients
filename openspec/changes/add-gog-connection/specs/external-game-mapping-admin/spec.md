# Spec Delta

## Purpose

Lets moderators identify and match external store games while preserving source identifiers and requiring real source URLs where numeric IDs cannot form public links.

## ADDED Requirements

### Requirement: GOG category presentation and safe mapping
Mapping administration SHALL retain `Gog = 5`, display it as "GOG" and preserve numeric source IDs as identifiers. It SHALL NOT synthesize profile/store URLs from those IDs. GOG rows SHALL retain the existing manual match flow and source URL validation.

#### Scenario: Unmapped numeric GOG product
- **WHEN** the queue contains category `5` with a numeric `sourceUid`
- **THEN** its source label reads "GOG" and its visit action remains disabled because there is no derived lookup URL
- **AND** Match opens with an empty source URL rather than an invented store URL

#### Scenario: Moderator supplies a real source URL
- **WHEN** the moderator selects a catalogue game and enters a valid source URL for that GOG product
- **THEN** submission retains category `5`, the original source ID, selected game and supplied URL, using the existing validation and conflict handling

#### Scenario: Published store link
- **WHEN** a game already has a server-supplied GOG store URL
- **THEN** the existing store link uses that URL without substituting the numeric product ID
