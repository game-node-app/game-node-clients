# Spec Delta

## Purpose

Defines how the web and mobile clients present the Daily ranking: the ranking page with its filters, podium, table, viewer summary and states, the hub ranking panel, and the ranking card on the daily result screen.

## ADDED Requirements

### Requirement: Ranking page and its filters
The clients SHALL offer a Daily ranking page at `/daily/ranking`, reachable from the Daily hub. It SHALL filter by mode (Overall, Cover, Artwork, Keywords, Specs; default Overall), period (Today, Week, Month, All time; default Week) and scope (Everyone, People I follow; default Everyone). Each combination SHALL show the server's list for exactly that mode, period and scope.

#### Scenario: Default view
- **WHEN** a player opens the ranking page
- **THEN** it shows the overall ranking of the current week for everyone

#### Scenario: Changing a filter
- **WHEN** a player selects Cover and Month
- **THEN** the podium, table, summary and pinned row show the Cover ranking of the current month

#### Scenario: Mobile filters
- **WHEN** the page is shown on a narrow screen or in the mobile app
- **THEN** mode and period filters are horizontally scrolling chips and the scoring explainer opens from a help button in the header

### Requirement: Scope requires a session
"People I follow" SHALL be selectable only by a signed-in player. Signed out, the option SHALL be shown disabled and the clients SHALL NOT request the following scope.

#### Scenario: Signed out
- **WHEN** a guest opens the ranking page
- **THEN** "People I follow" is disabled and no following-scope request is made

#### Scenario: Signing out while following is selected
- **WHEN** the session ends while "People I follow" is selected
- **THEN** the page falls back to Everyone

### Requirement: Podium
The first three positions of the list SHALL be shown as a podium (1st in the middle and highlighted, 2nd left, 3rd right) with avatar, username, Premium badge when present, points and streak. When the list has fewer than three players, each missing place SHALL show an "Open spot" placeholder instead of shifting players.

#### Scenario: Two players today
- **WHEN** the Today list has two players
- **THEN** places 1 and 2 show them and place 3 shows "Open spot · Play today to get in"

### Requirement: Ranking table
Positions from 4 onward SHALL be listed in a table. Every row SHALL show position, position change, avatar, username linking to the profile, Premium badge, points, streak and win rate. Overall rows SHALL also show points per mode; mode rows SHALL instead show wins, average attempts and best streak.

#### Scenario: Overall columns
- **WHEN** the mode filter is Overall
- **THEN** the columns are position, player, points, points by mode, streak and win rate

#### Scenario: Mode columns
- **WHEN** the mode filter is Cover
- **THEN** the columns are position, player, points, solved, average attempts, best streak and win rate

#### Scenario: Missing mode value
- **WHEN** a player has no points in a mode or no average attempts
- **THEN** that cell shows a dash instead of a number

### Requirement: Position change indicator
Each row SHALL show its change since the previous snapshot: an up arrow with the amount when positive, a down arrow with the amount when negative, a dash when zero, a "new" label when the player is new, and nothing when the server gives no change (Today, or before the snapshot is ready).

#### Scenario: Moved up
- **WHEN** a row's change is 3
- **THEN** it shows a green up arrow and 3

#### Scenario: Today
- **WHEN** the period is Today
- **THEN** no row shows a change indicator

### Requirement: Number formatting
Points, averages and win rates SHALL be shown with the formatting of the active language, with one decimal place only where the value has one, and SHALL NOT be recomputed or rounded differently from the server's value.

#### Scenario: Decimal points in Portuguese
- **WHEN** a Specs player has 2.4 points and the language is pt-BR
- **THEN** the value reads "2,4"

#### Scenario: Large totals
- **WHEN** the total player count is 3812 in pt-BR
- **THEN** it reads "3.812"

### Requirement: Loading more positions
The table SHALL load further pages on demand with a "Load more" action and SHALL show how many positions are visible out of the total players. The action SHALL disappear when no further page exists.

#### Scenario: Load more
- **WHEN** a player presses "Load more"
- **THEN** the next page is appended and the caption updates, for example "Showing 4–30 of 3,812 players"

### Requirement: Premium badge
The Premium badge SHALL be rendered only from the row's supporter badge flag and SHALL NOT change any number, position or ordering.

#### Scenario: Hidden badge
- **WHEN** a supporter hid their badge
- **THEN** their row has no Premium badge

### Requirement: Viewer row pinned to the bottom
When the viewer has a ranking row that is not among the loaded rows or the podium, the page SHALL pin that row to the bottom of the viewport with a "You" badge while scrolling. When the viewer's row is visible in the podium or table, it SHALL be highlighted there instead.

#### Scenario: Viewer outside the loaded page
- **WHEN** the viewer is #142 and the loaded table ends at #10
- **THEN** a pinned row shows #142 with the "You" badge, change, points and the same columns as the table

#### Scenario: Viewer inside the page
- **WHEN** the viewer is #7
- **THEN** row #7 is highlighted with the "You" badge and no pinned row is shown

### Requirement: Viewer summary
For a signed-in viewer with a row, the page SHALL show "Your summary" for the selected period with position, points and streak (best streak in a mode view), and SHALL show "N pts to the top 100" only when the server gives that gap.

#### Scenario: Gap shown
- **WHEN** the viewer is #142 and the gap to the top 100 is 38
- **THEN** the summary reads "38 pts to the top 100"

#### Scenario: Inside the top 100
- **WHEN** the server gives no gap
- **THEN** the summary has no gap line

#### Scenario: Signed in without a result
- **WHEN** a signed-in player has no row in the selected list
- **THEN** the summary invites them to play today's Daily instead of showing numbers

### Requirement: Scoring explainer
The page SHALL explain the scoring: Cover, Artwork and Keywords give 6 points on the first attempt down to 1 on the sixth and 0 when not guessed; Specs gives 0.6 per remaining life (6 to 0.6); skips count as attempts; archive plays do not count; finishing all four modes in a day adds 2 points.

#### Scenario: Desktop explainer
- **WHEN** the overall ranking is shown on a wide screen
- **THEN** the side column shows "How scoring works" expanded, and it can be collapsed

#### Scenario: Mobile explainer
- **WHEN** a mobile player taps the help button
- **THEN** the scoring explainer opens in a modal

### Requirement: Period end
The page header SHALL show when the selected period ends ("Week ends in 3d 14h"), from the server's end instant, and SHALL hide it for All time.

#### Scenario: All time
- **WHEN** the period is All time
- **THEN** no end countdown is shown

### Requirement: Few players state
When the selected list has no players beyond the podium, the table SHALL say that further positions will appear there. For Today, the page SHALL also show a "still early" banner with the number of players who scored today and a "Play the Daily" action.

#### Scenario: Early in the day
- **WHEN** two players have scored today and Today is selected
- **THEN** the banner reads "Still early: 2 players scored today", "Play the Daily" opens the hub, and the table shows the empty message

#### Scenario: Nobody yet
- **WHEN** no one has scored in the selected list
- **THEN** all three podium places are open spots and the table shows the empty message

### Requirement: Signed-out ranking
Guests SHALL see the same public list, without summary or pinned row, and with a card inviting them to sign in or create an account to compete, noting that today's progress stays on the device until they sign in.

#### Scenario: Guest
- **WHEN** a guest opens the ranking page
- **THEN** the bottom card shows "Sign in to compete in the ranking" with "Create account" and "Sign in"

### Requirement: Ranking freshness
The clients SHALL load the ranking when the page or panel opens or a filter changes, and SHALL refresh ranking data after the viewer finishes a daily puzzle. They SHALL NOT poll the ranking on a timer.

#### Scenario: After finishing a puzzle
- **WHEN** a player finishes a daily puzzle and then opens the ranking
- **THEN** the ranking is requested again instead of showing the cached list from before the finish

### Requirement: Ranking load failure
When the ranking cannot be loaded, the page and the hub panel SHALL show an error with a retry action instead of an empty list.

#### Scenario: Network error
- **WHEN** the ranking request fails
- **THEN** an error state with "Try again" is shown

### Requirement: Hub ranking panel
The Daily hub SHALL show a "Ranking of the week" panel with the overall week top three (position, avatar, username, points), the viewer's position with its change when they have a row, and a "See full ranking" action. The hub header SHALL also offer a "Ranking" action.

#### Scenario: Signed-in viewer
- **WHEN** the viewer is #142 and moved up 12
- **THEN** the panel header reads "You: #142 (+12)"

#### Scenario: Fewer than three players
- **WHEN** the week list has one player
- **THEN** the panel lists that player and an invitation to play instead of empty rows

### Requirement: Result screen ranking card
After finishing today's daily puzzle as a signed-in player, the result screen SHALL show a ranking card built only from the play response's ranking block: points earned plus bonus, the week position and how it changed, week points, the gap to the top 100 when given, and a "See ranking" action. Without that block, no card SHALL be shown.

#### Scenario: Moved up
- **WHEN** the result earned 4 points and moved the player from #154 to #142
- **THEN** the card reads "+4 pts in the ranking · you rose to #142" and "Week: 1,084 pts. 38 pts to the top 100."

#### Scenario: Completion bonus
- **WHEN** the result earned 3 points and a 2-point bonus
- **THEN** the card shows +5 pts and mentions the bonus for finishing all four modes

#### Scenario: First counted result this week
- **WHEN** the previous week position is null and the new position is 300
- **THEN** the card says the player entered the ranking at #300

#### Scenario: Archive play
- **WHEN** an archive puzzle is finished and the result did not count
- **THEN** the card says archive plays do not score, without points or position change

#### Scenario: Guest, weekly or practice
- **WHEN** the result has no ranking block
- **THEN** no ranking card is shown
