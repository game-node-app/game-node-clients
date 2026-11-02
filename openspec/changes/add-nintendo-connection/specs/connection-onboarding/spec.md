# Spec Delta

## MODIFIED Requirements

### Requirement: Pasting the delegated code
The paste-code step SHALL submit the trimmed pasted text unchanged as `callbackParams.code` to `POST /v1/connections/:type/auth/callback`, along with the `state` from init. The server extracts the code. Before sending, the step SHALL run the provider's local check, because a failed callback uses up the single-use `state`. Input that fails the check SHALL show an inline error and send nothing. For `epicgames`, the step SHALL accept either the raw authorization code or the whole JSON page that Epic displays, and the check SHALL require a 32-character hexadecimal code. The check for `nintendo` is defined in "Pasting the Nintendo account link".

#### Scenario: Pasting the raw code
- **WHEN** the user pastes ` 0123456789abcdef0123456789abcdef ` for Epic Games and submits
- **THEN** the callback is sent with `callbackParams.code` set to `0123456789abcdef0123456789abcdef` and the `state` from init

#### Scenario: Pasting the whole Epic page
- **WHEN** the user pastes `{"redirectUrl":"…","authorizationCode":"0123456789abcdef0123456789abcdef","sid":null}` for Epic Games and submits
- **THEN** the callback is sent with that text as `callbackParams.code`

#### Scenario: Input without a code
- **WHEN** the user pastes `{"sid":null}` or an empty value for Epic Games and submits
- **THEN** an inline error asks for the code and no request is sent

## ADDED Requirements

### Requirement: Pasting the Nintendo account link
For `nintendo`, the paste step SHALL ask for the link behind Nintendo's "Select this account" button, and SHALL tell the user to copy that link (right-click or long-press) without clicking it. The local check SHALL require text that starts with `npf5c38e31cd085304b://auth#` and whose fragment has a `session_token_code` and a `state` equal to the current attempt's `state`.

#### Scenario: Pasting the account link
- **WHEN** init returned state `abc123` and the user pastes ` npf5c38e31cd085304b://auth#session_token_code=eyJ…&state=abc123&session_state=… ` and submits
- **THEN** the callback is sent with the trimmed link as `callbackParams.code` and `state` `abc123`

#### Scenario: Pasted text is not an account link
- **WHEN** the user pastes `https://accounts.nintendo.com/` or a link without `session_token_code` and submits
- **THEN** an inline error says no Nintendo account link was found, and no request is sent

#### Scenario: Link from an earlier attempt
- **WHEN** the pasted link's `state` differs from the current attempt's `state`
- **THEN** an inline error asks the user to copy the link from the sign-in opened by this attempt, and no request is sent

#### Scenario: Epic Games is unchanged
- **WHEN** a user pastes an Epic code in the Epic Games setup
- **THEN** the Epic instructions, JSON preview and 32-character check apply, and the Nintendo instructions and check do not

### Requirement: Nintendo coverage and privacy notice
The Nintendo setup SHALL tell the user, before they sign in, what the link imports:
- only games played on Switch or Switch 2 after the Nintendo Account was linked to a console;
- not games hidden in Nintendo's app, and not games owned but never played;
- playtime and first and last played dates, which come from Nintendo.

It SHALL also say how to revoke access and that copying the link may not work on a phone.

#### Scenario: Opening Nintendo setup
- **WHEN** a user opens connection setup for `nintendo` and reaches the sign-in step
- **THEN** the coverage notice, the revoke instructions and the phone hint are shown in the user's language (English or Brazilian Portuguese)

#### Scenario: Other providers
- **WHEN** a user opens connection setup for `epicgames`
- **THEN** no Nintendo notice is shown

### Requirement: Nintendo presentation
Wherever the apps name or picture a connection, `nintendo` SHALL appear as "Nintendo" with the server-stored `nintendo` icon, including connection setup, notifications and the importer. Because Nintendo has no public profile page, a Nintendo connection on a user profile SHALL show its icon without a link. The mobile connections list SHALL include Nintendo. The importer SHALL accept `nintendo` as a source at `/importer/nintendo`.

#### Scenario: Mobile connections list
- **WHEN** a user opens connections in the mobile app
- **THEN** Nintendo is listed with its icon and status after Epic Games

#### Scenario: Importing from Nintendo
- **WHEN** a user with a connected Nintendo account opens `/importer/nintendo`
- **THEN** the importer lists the unprocessed Nintendo games and refers to the source as "Nintendo"

#### Scenario: Reauthorization notification
- **WHEN** a user has a `connection.reauth-required` notification with provider `nintendo`
- **THEN** it reads "Your Nintendo connection needs to be reconnected." with the `nintendo` icon, and selecting it navigates to `/preferences/connections`

#### Scenario: Import notification
- **WHEN** a user has an import notification with provider `nintendo` for 3 games
- **THEN** it says 3 new games are ready to be imported from the Nintendo connection, and selecting it navigates to `/importer/nintendo`

#### Scenario: Profile connections
- **WHEN** someone views a profile with a Nintendo connection
- **THEN** the Nintendo icon is shown and is not a link to an external page
