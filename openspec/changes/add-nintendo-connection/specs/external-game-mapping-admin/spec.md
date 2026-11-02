# Spec Delta

## ADDED Requirements

### Requirement: Nintendo title IDs in the unmapped queue
The unmapped external games table SHALL name category `1002` "Nintendo Title ID". Nintendo has no public page keyed by title ID, so the row's visit action SHALL be disabled. The "Match" action SHALL work for these rows as for any other category: the source URL starts empty, and the moderator must enter one before submitting with category `1002`.

#### Scenario: Nintendo title row
- **WHEN** the unmapped table contains an entry with category `1002`, source ID `0100F2C0115B6000` and name "The Legend of Zelda: Tears of the Kingdom"
- **THEN** its source reads "Nintendo Title ID", its name is shown, and its visit action is disabled

#### Scenario: Matching a Nintendo title
- **WHEN** a moderator matches that entry to a catalog game and enters a valid source URL
- **THEN** the mapping is submitted with `sourceUid` `0100F2C0115B6000` and category `1002`, and the entry leaves the table after refetch
