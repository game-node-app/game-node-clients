# Spec Delta

## Purpose

Defines how players find, play and compare the weekly Daily challenge in the web and mobile clients, and keeps weekly results apart from the daily puzzles' stats and streaks.

## ADDED Requirements

### Requirement: Weekly card on the hub
The hub SHALL show a "Weekly" section with a "Challenge of the week" card (one hard game, 10 attempts, ranking among friends) and a "Resets Monday" note when the today response has a weekly challenge, and SHALL hide the section when it has none. The card SHALL reflect the player's status: not started, in progress with attempts, won with attempts, or lost.

#### Scenario: No challenge this week
- **WHEN** the today response's weekly entry is null
- **THEN** the hub has no Weekly section

#### Scenario: Won
- **WHEN** the signed-in player won this week's challenge in 4 attempts
- **THEN** the card reads that they got it in 4 and opens the result

#### Scenario: Guest progress
- **WHEN** a guest finished the challenge on this device
- **THEN** the card shows the status stored on the device

### Requirement: Weekly play screen
The clients SHALL offer the weekly challenge at `/daily/weekly`, played with the Specs rules (10 attempts, Specs columns and hint). Its header SHALL name the challenge and its number and count down to the week's end. It SHALL NOT show the four-mode stepper, the next-mode action, the archive link or a ranking points card.

#### Scenario: Opening the challenge
- **WHEN** a player opens `/daily/weekly`
- **THEN** the header reads "Challenge of the week #7" with "Ends in 3d 14h" and the Specs board is shown

#### Scenario: No challenge
- **WHEN** there is no current challenge
- **THEN** the screen says there is no weekly challenge and offers a way back to the hub

### Requirement: Weekly result
After the challenge finishes, the screen SHALL show the answer, the guesses and share text naming the weekly challenge and its number, and a "Back to the Daily" action.

#### Scenario: Share text
- **WHEN** a player copies the weekly result
- **THEN** the text names "Challenge of the week #7" instead of a daily number and mode

### Requirement: Friends ranking
After finishing, a signed-in player SHALL see the friends ranking of the current challenge: the viewer and followed players who finished, in the server's order, with position, avatar, username, Premium badge and attempts (or "not guessed"), the viewer highlighted. With only the viewer, it SHALL invite them to follow players.

#### Scenario: Viewer second
- **WHEN** followed players won in 3 and 5 attempts and the viewer in 4
- **THEN** the list shows 1st 3 attempts, 2nd the viewer with 4, 3rd 5 attempts

#### Scenario: Losers last
- **WHEN** a followed player lost
- **THEN** they appear after the winners with "not guessed"

### Requirement: Guests and the friends ranking
Guests SHALL NOT request the friends ranking. After finishing, they SHALL see a prompt to sign in to compare with friends, and their finished play SHALL be imported to the account after signing in.

#### Scenario: Guest finishes
- **WHEN** a guest finishes the challenge
- **THEN** a sign-in prompt replaces the friends ranking and no request is made

#### Scenario: Guest signs in
- **WHEN** that guest signs in
- **THEN** the weekly play is imported with the other finished guest plays

### Requirement: Weekly results stay apart
Weekly plays SHALL NOT count in the daily stats panel, the daily streak or the archive, on the device or from the account.

#### Scenario: Guest streak
- **WHEN** a guest's only finished play today is the weekly challenge
- **THEN** the daily streak and "N of 4 today" do not count it
