# Spec Delta

## Purpose

Render the new Guild Community Bounty notification.

## ADDED Requirements

### Requirement: Community Bounty ready notification
The inbox SHALL render `guild.community-bounty-ready` items with the Guild shield as leading visual and the translated "A Community Bounty reached its goal. Claim your reward." text, and opening one SHALL navigate to `/guild?tab=bounties&bountyId=<target.bountyId>`. Guild targets with `contractId` SHALL keep navigating to `/guild?tab=accepted`.

#### Scenario: Open bounty notification
- **WHEN** the user opens a `guild.community-bounty-ready` item with `target: { type: "guild", bountyId: "3ab3…" }`
- **THEN** the app navigates to `/guild?tab=bounties&bountyId=3ab3…`
