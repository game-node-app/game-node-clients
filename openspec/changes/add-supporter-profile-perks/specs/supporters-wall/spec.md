# Spec Delta

## Purpose

Defines the public supporters wall: which data it shows, how it pages through `GET /v1/supporters`, and where each client presents it.

## ADDED Requirements

### Requirement: Wall content
The supporters wall SHALL list the users returned by `GET /v1/supporters` in the server's order, each with avatar and username linking to that user's profile. It SHALL NOT show or derive plan, status, interval, dates or any other billing data.

#### Scenario: Wall item
- **WHEN** the wall shows a supporter whose `avatar` is null
- **THEN** the item shows the default avatar and the username, and selecting it opens their profile

#### Scenario: Server order
- **WHEN** the server returns supporters ordered by username
- **THEN** the wall keeps that order and does not re-sort or group them

### Requirement: Wall pagination
The wall SHALL load supporters in pages using `offset` and `limit` within the server's 1–100 bounds, and SHALL offer loading the next page while `pagination.hasNextPage` is true.

#### Scenario: More supporters
- **WHEN** the first page returns `hasNextPage: true`
- **THEN** a "Show more" action loads the next page and appends it

#### Scenario: Last page
- **WHEN** a page returns `hasNextPage: false`
- **THEN** no "Show more" action is shown

### Requirement: Wall placement
The web About page SHALL show the wall as a public section, available signed out. The mobile Supporter screen SHALL show the same wall at its end. The wall SHALL be readable without sign-in on web.

#### Scenario: Signed-out web visitor
- **WHEN** a signed-out visitor opens the About page
- **THEN** the supporters wall section loads and shows the current supporters

#### Scenario: Mobile
- **WHEN** a signed-in mobile user opens Preferences › Supporter
- **THEN** the supporters wall appears after the billing help

### Requirement: Empty and failed wall
When the server returns no supporters, the wall SHALL show an invitation to become the first supporter with the supporter entry link. When the request fails, the wall SHALL show a retry action and SHALL NOT break the surrounding page.

#### Scenario: Billing not configured
- **WHEN** the server responds 200 with an empty list
- **THEN** the wall shows the empty invitation

#### Scenario: Request failure
- **WHEN** the wall request fails
- **THEN** the section shows a short error with "Try again", and the rest of the About page renders normally

### Requirement: Wall freshness after opting out
After the signed-in user changes `showOnSupportersWall`, the client SHALL refetch the wall the next time it is shown.

#### Scenario: Leaving the wall
- **WHEN** a supporter turns off "Show me on the supporters wall" and then scrolls to the wall on the same screen
- **THEN** the wall is reloaded and no longer lists them
