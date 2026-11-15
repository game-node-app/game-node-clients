# Spec Delta

## Purpose

Defines what the `/recap` page shows for a chosen period, the share card formats and templates, and how the card is exported as an image.

## ADDED Requirements

### Requirement: Period summary
The recap page SHALL show a summary for the signed-in user's week, month or year, chosen by the user, with week selected by default. The summary SHALL include the total time played, the number of games played, finished and reviewed, the top game, the top genre and the top platform by time played, and the five most played games with their covers. The summary SHALL also show the change in time played against the previous period of the same length.

#### Scenario: Period with activity
- **WHEN** the user has playtime in the selected period
- **THEN** the page shows the hero figure in hours, the top game, genre and platform, and the five most played games

#### Scenario: Comparison with the previous period
- **WHEN** the previous period has playtime
- **THEN** the card shows the difference in time played as a percentage, and no percentage when the previous period has none

#### Scenario: Period without activity
- **WHEN** the selected period has no playtime
- **THEN** the page explains there is nothing to show and links to the connections preferences, and the share and download actions are disabled

#### Scenario: Switching period
- **WHEN** the user selects another period
- **THEN** the summary and the card update for that period without leaving the page

### Requirement: Card formats and templates
The page SHALL offer a Story format of 1080x1920 pixels and a Feed format of 1600x900 pixels. Story SHALL offer only the Poster, Dash and Bento templates, and Feed SHALL offer only the summary template. There SHALL be no Covers template and no cover grid options (grid size, excluded games, source or recent and lifetime playtime). Every template SHALL be built from the same period summary.

#### Scenario: Choosing a format
- **WHEN** the user selects Story or Feed
- **THEN** the preview takes that aspect ratio, shows that format's templates and the exported image has that size in pixels

#### Scenario: Story templates
- **WHEN** Story is selected
- **THEN** Poster, Dash and Bento are offered, and the summary template does not appear as a choice

#### Scenario: Feed template
- **WHEN** Feed is selected
- **THEN** the summary is drawn and the Story templates are not offered

#### Scenario: Covers removed
- **WHEN** the user opens the page in either format
- **THEN** the Covers template and its grid, exclusion, source and playtime controls are absent, and changing period, format or template keeps reading the period summary

### Requirement: Card customization
The summary templates SHALL let the user choose the accent color from a fixed set, the figure shown in the card's free slot (finished games, reviews or started games), and whether the comparison with the previous period is drawn, which SHALL be off by default. Templates that draw game art (Poster and Bento) SHALL also let the user choose which of the ranked games provides the art and how visible it is. Each choice SHALL be applied to the preview and to the exported image, and the user SHALL be able to restore the defaults.

#### Scenario: Comparison is opt-in
- **WHEN** the user has not enabled the comparison
- **THEN** no template shows the change against the previous period

#### Scenario: Choosing the backdrop game
- **WHEN** the user picks one of the ranked games for the art
- **THEN** the Poster and Bento templates draw that game's art, and the choice falls back to the most played game if that game leaves the ranking

#### Scenario: Art opacity
- **WHEN** the user moves the opacity control
- **THEN** the art is drawn at that visibility, and until the user moves it each template keeps its own default

#### Scenario: Restoring the defaults
- **WHEN** the user restores the customization
- **THEN** every choice returns to its default and the card looks as before

### Requirement: Card export
Sharing or downloading SHALL export the card at its native pixel size, regardless of the preview scale or the device's screen size. The exported image SHALL show the user's avatar and name, the period label and the GameNode logo.

#### Scenario: Export on a small screen
- **WHEN** the user shares from a phone-sized screen
- **THEN** the exported image still has the selected format's size in pixels and matches the preview

#### Scenario: Share is unavailable
- **WHEN** the platform share action throws
- **THEN** the page shows an error notification and keeps the card and options

#### Scenario: Download
- **WHEN** the user chooses download
- **THEN** the image is saved as a file instead of shared

### Requirement: Signed-in access
The recap page SHALL require a signed-in user and SHALL only show that user's own summary.

#### Scenario: Signed-out visit
- **WHEN** a signed-out visitor opens the page
- **THEN** the app's sign-in flow is shown instead of the summary
