# Spec Delta

## Purpose

Defines how the GameNode web, admin and mobile clients sign users in through social providers, report sign-in failures and lockouts, guard pages by session and role, sign users out, manage linked sign-in methods, and return native sign-ins to the app.

## ADDED Requirements

### Requirement: Social sign-in screen
Each client SHALL offer one branded sign-in screen with Google, Discord and X buttons. X SHALL start the `twitter` provider. No other sign-in method SHALL be offered. A signed-in user who opens the screen SHALL be sent to the home page.

#### Scenario: Provider choice
- **WHEN** a signed-out person opens the sign-in screen on web, admin or mobile
- **THEN** they see the GameNode brand and buttons labeled "Continue with Google", "Continue with Discord" and "Continue with X", and nothing else that signs them in

#### Scenario: Starting a provider
- **WHEN** the person selects a provider button
- **THEN** that button shows a pending state, the other buttons are disabled, and the browser goes to the provider's authorization page

#### Scenario: Already signed in
- **WHEN** a signed-in user opens the sign-in screen
- **THEN** the client sends them to the home page without showing the provider buttons

### Requirement: Return to the requested page
After a successful sign-in, the client SHALL return the user to the page that sent them to sign-in. Only same-origin relative paths SHALL be accepted as return targets. Anything else SHALL fall back to the home page. On web, a newly created user SHALL go to the onboarding wizard instead.

#### Scenario: Protected page redirect
- **WHEN** a signed-out person opens the web library page, is sent to sign-in, and completes Google sign-in
- **THEN** they land back on the library page signed in

#### Scenario: External return target
- **WHEN** the sign-in screen is opened with a return target that is an absolute URL or starts with `//`
- **THEN** a successful sign-in lands on the home page

#### Scenario: New web user
- **WHEN** a person with no GameNode account completes sign-in on web
- **THEN** they land on the onboarding wizard

### Requirement: Sign-in failure messages
When a provider sign-in fails, the sign-in screen SHALL show a message for the error code it received and keep the provider buttons usable. It SHALL use specific messages for a cancelled authorization, a provider that shares no email, an email owned by an account that is not linked, and an expired or mismatched sign-in attempt. Any other code SHALL get a generic message.

#### Scenario: Unlinked account with the same email
- **WHEN** sign-in returns with `account_not_linked`
- **THEN** the screen explains that the email already belongs to an account, tells the user to sign in with the provider they used before and link the new one in Preferences, and leaves all buttons usable

#### Scenario: Provider shares no email
- **WHEN** sign-in returns with `email_not_found`
- **THEN** the screen tells the user the provider did not share an email address and suggests another provider

#### Scenario: User cancels at the provider
- **WHEN** the user denies access on the provider page and returns with `access_denied`
- **THEN** the screen shows a neutral "sign-in cancelled" notice rather than an error

#### Scenario: Unknown error code
- **WHEN** sign-in returns with an error code the client does not recognize
- **THEN** the screen shows a generic failure message and the buttons stay usable

### Requirement: Locked-out account notice
When a sign-in is refused because the account is suspended or banned, the sign-in screen SHALL show a locked-out state instead of the generic error. That state SHALL explain that the account cannot sign in and give a support contact. Clients SHALL NOT expose any other user's lockout details.

#### Scenario: Banned user signs in
- **WHEN** sign-in returns with `banned`
- **THEN** the screen shows the locked-out state with the support contact and a way back to the provider buttons

#### Scenario: Session revoked while browsing
- **WHEN** a signed-in user is locked out and their next API request is rejected as unauthenticated
- **THEN** the client treats them as signed out, and protected pages send them to the sign-in screen

### Requirement: Session-guarded pages
Pages and actions that require a session SHALL send signed-out users to the sign-in screen with a return target and SHALL NOT render protected content. Pages that allow anonymous use SHALL render for signed-out users. While the session is loading, guarded content SHALL NOT flash.

#### Scenario: Signed-out user opens a guarded page
- **WHEN** a signed-out person opens preferences, library, notifications or the importer
- **THEN** the client sends them to the sign-in screen with that page as the return target

#### Scenario: Anonymous action needing a session
- **WHEN** a signed-out person selects like on a game or review
- **THEN** the client sends them to the sign-in screen and records no like

#### Scenario: Public page while signed out
- **WHEN** a signed-out person opens a public game or profile page
- **THEN** the page renders without asking them to sign in

### Requirement: Role-guarded pages
Pages that require roles SHALL render only for users holding at least one of the listed roles, read from the signed-in user's current roles. Other signed-in users SHALL see an access-denied screen with links home and to sign out.

#### Scenario: Admin client for a non-staff user
- **WHEN** a signed-in user holding only `user` opens the admin client
- **THEN** they see the access-denied screen and no admin content

#### Scenario: Editor opens an editorial page
- **WHEN** a user holding `user,editor` opens a page that requires `editor` or `admin`
- **THEN** the page renders

### Requirement: Sign-out
Signing out SHALL end the session on the server, clear cached user data in the client, and leave the client signed out. On native it SHALL also delete the stored session token.

#### Scenario: Web sign-out
- **WHEN** a signed-in user signs out on web
- **THEN** they land on a public page, user-specific data is gone from the screen, and a guarded page sends them to sign-in

#### Scenario: Account restart
- **WHEN** a user completes the account restart in preferences
- **THEN** the client signs them out the same way

### Requirement: Linked sign-in methods
Preferences SHALL list Google, Discord and X with whether each is linked to the signed-in account. The user SHALL be able to link an unlinked provider and unlink a linked one. Unlinking SHALL be unavailable when only one method remains.

#### Scenario: Link a second provider
- **WHEN** a user signed in with Google selects link on Discord and completes Discord authorization with the same verified email
- **THEN** they return to the sign-in methods section and Discord shows as linked

#### Scenario: Link fails
- **WHEN** linking returns an error, for example because the identity belongs to another account or the email differs
- **THEN** the section shows the error and the list stays unchanged

#### Scenario: Last method
- **WHEN** the user has exactly one linked provider
- **THEN** its unlink control is disabled and explains that at least one sign-in method is required

#### Scenario: Unlink one of two
- **WHEN** a user with Google and Discord linked unlinks Discord and confirms
- **THEN** Discord shows as not linked and Google stays linked

### Requirement: Native app sign-in handoff
On native mobile, provider sign-in and linking SHALL run in a native browser auth session, not the app WebView. The session SHALL be returned only to the app's registered URL scheme on a trusted origin. The app SHALL keep it in on-device storage and authenticate API requests with a bearer token. A failed native sign-in SHALL show the same error messages as the sign-in screen.

#### Scenario: Native Google sign-in
- **WHEN** a signed-out native user selects Google and completes authorization in the native auth session
- **THEN** the session closes, control returns to the app, and the user is signed in in the app

#### Scenario: Native sign-in error
- **WHEN** a native sign-in returns to the app with an error code such as `account_not_linked` or `banned`
- **THEN** the app shows the sign-in screen with that error's message or the locked-out state

#### Scenario: Native user cancels
- **WHEN** the user closes the native auth session before finishing
- **THEN** the app stays on the sign-in screen with the buttons usable and no session

#### Scenario: App restart
- **WHEN** a signed-in native user closes and reopens the app
- **THEN** they are still signed in without a new provider sign-in

### Requirement: Allowed client origins
The auth server SHALL accept sign-in, linking and callback redirects only to configured client origins. The configuration SHALL include the website, the admin client, the mobile web build, the Capacitor WebView origins and the native app scheme for each environment.

#### Scenario: Mobile web sign-in in development
- **WHEN** a person signs in from the mobile web build on `http://localhost:3002`
- **THEN** the provider callback redirects back to `http://localhost:3002` signed in

#### Scenario: Untrusted callback origin
- **WHEN** a sign-in request names a callback URL on an origin that is not configured
- **THEN** the server rejects it and starts no authorization flow
