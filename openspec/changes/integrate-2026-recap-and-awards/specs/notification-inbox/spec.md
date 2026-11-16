# Spec Delta

## ADDED Requirements

### Requirement: Awards milestone notifications
An inbox item of type `awards.milestone` SHALL be rendered as a system item with the Awards icon and no actor avatar. Its text SHALL be localized client copy chosen from `preview.milestone` when present, and otherwise from `target.phase`; `preview.text` SHALL be used only when neither is recognized. Activating it SHALL open the Awards screen for `target.year` that matches the event's current phase.

#### Scenario: Voting open rendered in Portuguese
- **WHEN** the inbox contains an `awards.milestone` item with `preview.milestone: "voting_open"` and target `{ type: "awards", eventId: 12, year: 2026, phase: "voting" }` and the app language is pt-BR
- **THEN** the item reads "Votação do Awards 2026 aberta" with the Awards icon and no avatar

#### Scenario: Reminder distinguished from opening
- **WHEN** the item has `preview.milestone: "nominations_close_reminder"`
- **THEN** the item reads that Awards 2026 nominations close tomorrow, not that they opened

#### Scenario: Server without milestone field
- **WHEN** the item has no `preview.milestone` and `target.phase: "results"`
- **THEN** the item reads that the Awards 2026 results are out

#### Scenario: Activated after the phase moved on
- **WHEN** the user activates a `voting` item after the event reached `results`
- **THEN** the client opens `/awards/2026` so the phase redirect picks the result screen, and acknowledges the item as read

### Requirement: Recap milestone notifications
An inbox item of type `recap.milestone` SHALL be rendered as a system item with the Recap icon, reading "Your {year} recap is here" or "Your {year} closed" (localized) from `preview.milestone`, falling back to the "here" copy. Activating it SHALL open `/recap/{target.year}/{target.userId}`.

#### Scenario: Recap available
- **WHEN** the inbox contains a `recap.milestone` item with target `{ type: "recap", userId: "abc", year: 2026 }`
- **THEN** the item reads "Sua retrospectiva 2026 chegou" in pt-BR and activating it opens `/recap/2026/abc`

### Requirement: Goal reminder notifications
An inbox item of type `goal.reminder` SHALL be rendered as a system item showing the goal progress from `preview.finished` and `preview.target` for `target.year`. Activating it SHALL open the recipient's Recap of the previous year, where the goal card lives.

#### Scenario: July reminder
- **WHEN** the inbox contains a `goal.reminder` item with preview `{ target: 18, finished: 7 }` and target `{ type: "goal", year: 2027 }`
- **THEN** the item reads that 7 of 18 games are finished for the 2027 goal, and activating it opens `/recap/2026/{userId}`

### Requirement: System notifications need no extra requests
Rendering `awards.milestone`, `recap.milestone` and `goal.reminder` items SHALL NOT trigger profile, event, Recap or game requests per item; all displayed data SHALL come from the inbox item.

#### Scenario: Inbox with event notifications
- **WHEN** the inbox page shows five Awards and Recap items
- **THEN** no request other than the inbox read is made to render them
