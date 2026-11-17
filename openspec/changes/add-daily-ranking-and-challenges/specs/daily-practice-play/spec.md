# Spec Delta

## Purpose

Defines how players start, resume and play unlimited Cover and Specs practice rounds in the web and mobile clients, and how the clients handle practice limits and failures.

## ADDED Requirements

### Requirement: Unlimited section on the hub
The hub SHALL show an "Unlimited" section ("No daily limit") with two cards: "Unlimited Cover" (random covers from the catalog, without waiting for tomorrow) and "Unlimited Specs" (practice the comparison with random games), each opening its practice screen.

#### Scenario: Opening Cover practice
- **WHEN** a player selects "Unlimited Cover"
- **THEN** the Cover practice screen opens

### Requirement: Practice screens
The clients SHALL offer practice at `/daily/cover/practice` and `/daily/specs/practice` and SHALL reject other modes by going back to the hub (mobile) or answering not found (web). A practice screen SHALL use the daily play board, hints, guess input, lives and feedback of its mode, with a header naming the practice, and without countdown, stepper, community statistics, share text, stats panel or ranking card.

#### Scenario: Artwork practice
- **WHEN** a player opens `/daily/artwork/practice`
- **THEN** no practice round is started and the player is sent back (mobile) or sees not found (web)

#### Scenario: Specs practice
- **WHEN** a player plays a Specs practice round
- **THEN** guesses show the same Specs columns and the hint becomes available as in the daily

### Requirement: Starting and resuming rounds
Opening a practice screen SHALL resume the round of that mode kept on the device for the current account (or guest), and SHALL start a new round when none is kept or the kept round is gone. The round id SHALL NOT appear in the URL or in shared text.

#### Scenario: Resume
- **WHEN** a player leaves a Cover round after two guesses and opens Cover practice again
- **THEN** the same round is shown with its two guesses

#### Scenario: Expired round
- **WHEN** the kept round no longer exists on the server
- **THEN** a new round starts without showing an error

#### Scenario: Different account
- **WHEN** a round kept on the device belongs to another account or was rejected as not playable
- **THEN** a new round starts for the current player

### Requirement: Finishing and playing again
After a practice round finishes, the screen SHALL reveal the answer with the same result panel as the daily and offer "Play again", which starts a new round of the same mode, and "Back to the Daily".

#### Scenario: Play again
- **WHEN** a player presses "Play again" after a win
- **THEN** a new round of the same mode starts with no guesses

### Requirement: Practice never affects the Daily
Practice plays SHALL NOT be stored as daily results on the device, SHALL NOT be imported on sign-in and SHALL NOT change daily stats, streaks, hub statuses or ranking data.

#### Scenario: Guest practice win
- **WHEN** a guest wins a practice round and then signs in
- **THEN** nothing from the practice is imported and the hub shows the same daily statuses as before

### Requirement: Practice limits and failures
When starting a round is rate limited, the screen SHALL say to wait a moment and let the player retry. When no practice answer is available, it SHALL say practice is unavailable and offer to try again. Other failures SHALL show the Daily error state with retry.

#### Scenario: Rate limited
- **WHEN** a player starts too many rounds and the server answers 429
- **THEN** the screen says too many rounds were started and offers "Try again"

#### Scenario: No candidate
- **WHEN** the server answers 503 when starting a round
- **THEN** the screen says practice is unavailable right now and offers "Try again"
