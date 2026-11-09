# Spec Delta

## Purpose

Lets a user choose which existing IGDB cover represents a game for them, return to the default cover, and control how custom covers are displayed to them.

## ADDED Requirements

### Requirement: Cover picker availability
The game page SHALL offer a cover picker on web and mobile to every visitor. It MUST NOT require a library entry or a supporter subscription. The collection entry add/edit form SHALL also offer an action to open the cover picker for its game, in both its full and compact layouts.

#### Scenario: Game not in the library
- **WHEN** a signed-in user without a library entry for the game opens the game page
- **THEN** the cover picker is available

#### Scenario: Collection entry form
- **WHEN** a signed-in user opens the add/edit form for a game
- **THEN** an action to open that game's cover picker is available without submitting the form

#### Scenario: Signed-out visitor browses options
- **WHEN** a signed-out visitor opens the cover picker
- **THEN** the options for that game are listed

### Requirement: Cover options listing
The picker SHALL list every option returned for the game, plus a choice representing the default cover. Each option SHALL show its image and its label, or a translated name for its kind when the label is null.

#### Scenario: Localized option
- **WHEN** an option has kind `localized` and label `Japan`
- **THEN** the picker shows its image labeled `Japan`

#### Scenario: Option without a label
- **WHEN** an option has kind `alternative` and a null label
- **THEN** the picker shows a translated name for the `alternative` kind

#### Scenario: Game without alternatives
- **WHEN** the options response is an empty list
- **THEN** the picker states that no alternative covers exist and offers no choice to store

#### Scenario: Option image cannot load
- **WHEN** an option's image fails to load in the picker
- **THEN** the picker shows a placeholder for that option without retrying the image

### Requirement: Current choice indication
For a signed-in user, the picker SHALL mark the stored option as selected, and SHALL mark the default cover as selected when no choice is stored.

#### Scenario: Stored choice
- **WHEN** the stored `coverOptionId` is 12 and the picker lists option 12
- **THEN** option 12 is marked as selected

#### Scenario: No stored choice
- **WHEN** the stored `coverOptionId` is null
- **THEN** the default cover is marked as selected

### Requirement: Storing and clearing a choice
Selecting an option SHALL store it using the option's id, never the image id. Selecting the default cover SHALL remove the stored choice. On success the picker SHALL show the new selection and the game's covers SHALL update.

#### Scenario: Choose an option
- **WHEN** a signed-in user selects option 18
- **THEN** the client stores `coverOptionId` 18 for that game and the game page shows that option's cover

#### Scenario: Return to the default
- **WHEN** a signed-in user with a stored choice selects the default cover
- **THEN** the stored choice is removed and the game page shows the default cover

#### Scenario: Rejected option
- **WHEN** storing a choice fails with a 400 or 404 response
- **THEN** the user sees an error notification and the previous selection stays marked

### Requirement: Sign-in prompt for choosing
Choosing or clearing a cover without a valid session SHALL ask the user to sign in rather than failing silently.

#### Scenario: Signed-out selection
- **WHEN** a signed-out visitor selects an option
- **THEN** no choice is stored and the user is offered a way to sign in

#### Scenario: Session expired
- **WHEN** storing a choice returns 401
- **THEN** the user is offered a way to sign in and no selection change is shown

### Requirement: Picker offers existing covers only
The clients SHALL NOT offer image upload, cropping or storage for game covers.

#### Scenario: Picker contents
- **WHEN** the picker is open
- **THEN** the only actions are selecting a listed option or the default cover

### Requirement: Custom cover display mode setting
Signed-in users SHALL be able to view and change their custom cover display mode in settings, choosing between `any`, `prefer_yours` and `none`, each with a translated explanation.

#### Scenario: Current mode shown
- **WHEN** a signed-in user whose profile mode is `prefer_yours` opens the setting
- **THEN** `prefer_yours` is shown as selected

#### Scenario: Mode changed
- **WHEN** a user changes the mode from `any` to `none`
- **THEN** the profile is updated and game covers on open and later screens follow the new mode without a reload

#### Scenario: Update fails
- **WHEN** updating the mode fails
- **THEN** the user sees an error notification and the previous mode stays selected

### Requirement: Mode none explanation in the picker
When the viewer's mode is `none`, the picker SHALL still allow storing a choice and SHALL explain that covers stay default until the mode changes.

#### Scenario: Picker in mode none
- **WHEN** a user with mode `none` opens the picker
- **THEN** the options remain selectable and a notice explains that custom covers are currently turned off
