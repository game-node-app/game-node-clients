# Spec Delta

## Purpose

Defines how clients react when the server refuses to create a collection because a free account reached its collection limit, and how that limit is communicated.

## ADDED Requirements

### Requirement: Limit rejection handling
When creating a collection fails with a response body whose `code` is `collection_limit_reached`, the collection form SHALL show an inline limit notice with the server-provided `limit` and a way to become a supporter, keep the form open with its values, and SHALL NOT show the generic error notification. The client SHALL decide this from the body `code`, not from the status alone.

#### Scenario: Free user at the limit
- **WHEN** a free user with 5 collections submits a new collection and the server responds 403 with `{ "code": "collection_limit_reached", "limit": 5 }`
- **THEN** the form shows "You've reached the free limit of 5 collections" with "Become a Supporter", and no red error notification appears

#### Scenario: Other 403
- **WHEN** creating or updating a collection fails with 403 and a body without that code
- **THEN** the client keeps its existing generic error handling

#### Scenario: Server error while deciding
- **WHEN** creating a collection fails with a 5xx response
- **THEN** the generic error handling is shown and no limit notice appears

### Requirement: Limit notice upgrade path
The limit notice's supporter action SHALL lead to the supporter settings surface, through sign-in when needed, and the notice SHALL say that existing collections are kept.

#### Scenario: Become a Supporter from the notice
- **WHEN** a signed-in web user selects "Become a Supporter" in the notice
- **THEN** the form closes and the settings Supporter tab opens

#### Scenario: Mobile upgrade path
- **WHEN** a mobile user selects "Become a Supporter" in the notice
- **THEN** the form closes and the Preferences Supporter screen opens

### Requirement: Limit applies to creation only
Clients SHALL NOT hide, lock or restrict existing collections, editing, or adding games to collections because of the limit, and SHALL NOT block the create form before the server responds.

#### Scenario: Editing above the limit
- **WHEN** a free user who owns 8 collections edits one of them
- **THEN** the update proceeds normally with no limit notice

#### Scenario: Retry after dropping below
- **WHEN** a user who saw the limit notice deletes collections and submits again
- **THEN** the form sends the request and creates the collection if the server accepts it
