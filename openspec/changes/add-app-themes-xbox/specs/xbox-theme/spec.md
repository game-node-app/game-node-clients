# Spec Delta

## Purpose

Defines the Xbox-inspired theme: its palette and typography and the console-style screens it shows on web and mobile, as GameNode's first complete theme.

## ADDED Requirements

### Requirement: Xbox palette and typography
The Xbox theme SHALL use a near-black background and surfaces, white text, grey muted text, green accent and focus colors, a 4px radius, and the Segoe UI system font where installed (Inter, then Roboto otherwise). Segoe SHALL NOT be bundled. It SHALL use the `console` experience.

#### Scenario: Windows user
- **WHEN** a Windows user with Segoe UI selects Xbox
- **THEN** text renders in Segoe UI on a near-black background with green accents

#### Scenario: Non-Windows user
- **WHEN** a user without Segoe UI selects Xbox
- **THEN** text falls back to Inter (then Roboto) and no Segoe font file is downloaded

### Requirement: No official marks or sounds
The Xbox theme SHALL NOT ship Microsoft logos, startup sounds or other copyrighted assets. It SHALL show the "Xbox" name only as the theme label in Appearance together with the non-affiliation disclaimer.

#### Scenario: Selecting Xbox
- **WHEN** a user selects Xbox
- **THEN** no sound plays and no Microsoft logo appears anywhere in the app

### Requirement: Xbox focus and selection style
Focusable cards, tiles, tabs and buttons under Xbox SHALL show a visible green focus ring and a selected state that meets 3:1 contrast against its background.

#### Scenario: Keyboard focus
- **WHEN** a web user tabs onto a game tile or blog card
- **THEN** a green ring is drawn around it, inside any clipping container

### Requirement: Xbox home sections
On the Xbox home (web and mobile), releases SHALL show as a "coming soon" spotlight for the selected upcoming game, a week timeline with each day's releases and an on-demand month calendar, and a recently-released banner paged with arrows and dots. Recent blog posts SHALL show as a row of same-size tiles.

#### Scenario: Week timeline
- **WHEN** the user views the releases section
- **THEN** today and the next six days are shown with each day's releases under its marker, and the full month calendar opens on request

#### Scenario: Recently released paging
- **WHEN** the user presses the next arrow on the recently-released banner
- **THEN** the next game's art, cover, date, name and summary are shown and the dots reflect the position

#### Scenario: Blog tiles
- **WHEN** recent blog posts load on the Xbox home
- **THEN** they render as equal-size tiles that each open the article

### Requirement: Xbox explore
On Xbox, explore SHALL show each category as a row of its trending games followed by wide art cards for the three best-rated of them.

#### Scenario: Category section
- **WHEN** a user opens explore on Xbox
- **THEN** each category shows its trending tile row and up to three wide cards for its best-rated games

### Requirement: Xbox game page
On Xbox, the game page SHALL show a tall hero with the game's art behind its cover, title, release date, score and library actions, a screenshot strip, then the description and a fact sheet (developers, platforms, stores, tags, time to beat, rating distribution by star).

#### Scenario: Game with screenshots
- **WHEN** a user opens a game that has screenshots
- **THEN** the hero uses the game's art, a screenshot strip auto-advances (pausing on hover and under reduced motion), and the fact sheet shows the median score with a per-star distribution

#### Scenario: Game without art
- **WHEN** a game has no artwork or screenshots
- **THEN** the hero falls back to the cover and the strip is omitted without empty gaps

### Requirement: Xbox profile (gamercard)
On Xbox, the profile SHALL show the banner behind a gamercard with avatar, username, level with XP progress, member-since date, follow counts, connections, featured achievements and the same profile actions as the default profile, followed by the profile tabs as pills with counts. The profile stats summary SHALL be one strip of headline numbers ending with backlog completion and its meter.

#### Scenario: Own profile
- **WHEN** a user views their own profile on Xbox
- **THEN** the gamercard shows their level and XP progress and offers editing the profile

#### Scenario: Profile tabs
- **WHEN** a user selects a profile tab
- **THEN** the selected pill is filled and shows its count

### Requirement: Xbox stats page
On Xbox, the profile stats page SHALL show a compact gamercard, the headline numbers strip, games per year as a line chart with pill tabs, and every distribution (genres, platforms, modes, etc.) as a ranked bar list with the finished share filled inside each bar.

#### Scenario: Distributions
- **WHEN** a user opens profile stats on Xbox
- **THEN** each distribution is a ranked list sized against its largest entry instead of radar or wide bar charts

### Requirement: Xbox feed, posts and activity
On Xbox, the posts feed SHALL show pill tabs over the posts, trending games and blog posts in a side column on wide screens, and a button to create a post. Posts SHALL show author and game, content, then comment/like/share actions. Activity items SHALL show cover, a one-line title and who did what.

#### Scenario: Wide feed
- **WHEN** a signed-in user opens posts on a wide web screen on Xbox
- **THEN** posts are in the main column, trending games and blog in the side column, and the create button opens the post editor

#### Scenario: Activity item
- **WHEN** an activity list renders on Xbox
- **THEN** each entry shows the game cover, a single-line title, and the user and action, linking to the same targets as the default item

### Requirement: Xbox notifications panel
On Xbox, the web notifications panel SHALL use the Xbox look (dark side panel, Xbox typography and focus) while keeping the same notifications, read state and actions.

#### Scenario: Open notifications
- **WHEN** a web user on Xbox opens notifications from the header
- **THEN** the panel opens in the Xbox style and marking as read works as before

### Requirement: Mobile parity
Every Xbox screen in this spec SHALL render on mobile at phone width without horizontal page scroll, using the native mobile navigation and modals.

#### Scenario: Xbox game page on phone
- **WHEN** a mobile user opens a game on Xbox
- **THEN** the hero, actions and fact sheet stack vertically and every action opens its native mobile modal
