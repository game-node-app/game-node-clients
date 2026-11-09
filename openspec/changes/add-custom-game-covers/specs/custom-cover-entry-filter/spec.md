# Spec Delta

## Purpose

Lets viewers narrow a library or collection to games for which the listing owner has chosen a custom cover.

## ADDED Requirements

### Requirement: Custom cover filter in library and collection views
Library and collection views SHALL offer a filter that restricts entries to games with a custom cover chosen by the listing owner. The filter SHALL default to off.

#### Scenario: Filter enabled on a library
- **WHEN** a viewer enables the filter on user B's library
- **THEN** only entries for games where B has a cover choice are listed

#### Scenario: Filter enabled on a collection
- **WHEN** a viewer enables the filter on a collection
- **THEN** only entries for games where the collection owner has a cover choice are listed

#### Scenario: Owner has no choices
- **WHEN** the filter is enabled and the owner has no cover choices
- **THEN** the view shows its empty state

#### Scenario: Pagination resets
- **WHEN** a viewer on a later page toggles the filter
- **THEN** the view returns to the first page

### Requirement: Filter is omitted when disabled
Listing requests SHALL include `hasCustomCover` only when the filter is enabled, and listings with and without the filter SHALL NOT share cached data.

#### Scenario: Filter disabled
- **WHEN** a listing is requested with the filter off
- **THEN** the request has no `hasCustomCover` value

#### Scenario: Toggling the filter
- **WHEN** a viewer toggles the filter on and back off
- **THEN** each state shows its own listing

### Requirement: Filtered listings follow choice changes
Listings with the filter enabled SHALL be refreshed after the signed-in user stores or removes a cover choice.

#### Scenario: Choice removed
- **WHEN** a user removes a game's cover choice while a filtered listing of their library is loaded
- **THEN** that game no longer appears in the filtered listing

### Requirement: Favorites listing supports the filter
The favorites data source SHALL accept the filter so that favorites can be restricted in the same way as library entries.

#### Scenario: Favorites requested with the filter
- **WHEN** favorites are requested with the filter enabled
- **THEN** the request sends `hasCustomCover=true` and the result is cached separately from the unfiltered favorites
