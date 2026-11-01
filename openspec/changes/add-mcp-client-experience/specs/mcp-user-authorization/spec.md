# Spec Delta

## Purpose

Let users finish an MCP client's OAuth connection to GameNode through the canonical website, with explicit consent and continuity across sign-in, including flows started from mobile.

## ADDED Requirements

### Requirement: Continue authorization through GameNode sign-in
When `/auth` receives the authorization server's signed request context, the system SHALL preserve it through social sign-in, errors and retries and resume that same authorization. It SHALL preserve repeated parameters and signature data. The OAuth flow SHALL take precedence over normal home and onboarding redirects without issuing tokens in the frontend.

#### Scenario: Signed-out user authorizes an assistant
- **WHEN** an MCP client starts authorization and the API sends a signed-out user to `/auth` with a signed OAuth query
- **THEN** the user can sign in using an existing GameNode social provider
- **AND** the pending client, state, requested scopes, redirect URI, resource values and PKCE challenge are preserved through server validation
- **AND** the flow proceeds to consent or the next server-authorized destination instead of the home page

#### Scenario: First GameNode sign-in during authorization
- **WHEN** a user creates their GameNode account by social sign-in during the pending OAuth flow
- **THEN** authorization resumes without being diverted to ordinary onboarding

#### Scenario: Sign-in fails then succeeds
- **WHEN** a social sign-in attempt fails and the user retries from the resulting error page
- **THEN** the original signed OAuth context remains available for the retry
- **AND** a successful retry resumes the same authorization rather than starting a different grant

### Requirement: Existing sessions and regular login remain usable
A signed-in user arriving at `/auth` with pending OAuth context SHALL continue that authorization subject to the server's reauthentication rules. Ordinary login SHALL retain safe relative return targets and current first-login behavior. Shared changes MUST NOT alter mobile native sign-in or admin login behavior.

#### Scenario: User is already signed in
- **WHEN** a signed-in user reaches `/auth` with a valid pending OAuth request that does not require reauthentication
- **THEN** the system resumes authorization once instead of sending the user home

#### Scenario: Server requires fresh sign-in
- **WHEN** the server requires reauthentication for a pending request despite an existing session
- **THEN** the sign-in screen lets the user complete sign-in and does not enter an automatic redirect loop

#### Scenario: Ordinary login has an unsafe return target
- **WHEN** an ordinary sign-in URL supplies an external or protocol-relative `redirectTo`
- **THEN** the system uses the existing safe fallback and does not navigate to that external destination
- **AND** ordinary new-user onboarding, admin sign-in and native callbacks retain their existing behavior

### Requirement: Identify the client and account on consent
The website SHALL serve `/oauth/consent` and display the active GameNode account, the requesting client's server-resolved name, client URI when provided and client identifier. For an HTTPS metadata-document identifier, it SHALL display that identifier's domain separately from the self-declared client URI without implying GameNode endorsement. Client metadata SHALL be rendered as untrusted content.

#### Scenario: Metadata-document client requests access
- **WHEN** the server sends the user to consent for a client identified by an HTTPS metadata document
- **THEN** the page shows the requesting application's name, full identifier and metadata-document domain
- **AND** the user can distinguish that domain from a different self-declared application website

#### Scenario: Dynamically registered client has incomplete or malicious metadata
- **WHEN** a requesting client has no name, a markup-like name or an unsafe website URI
- **THEN** the page shows the identifier as a fallback, escapes text and does not expose an executable website link
- **AND** it does not label an opaque registration identifier or self-declared name as a verified publisher

### Requirement: Explain exactly the requested permissions
Consent SHALL explain every requested scope, distinguishing reads, account changes, profile identity and continued access. It SHALL support `games:read`, `library:read`, `library:write`, `reviews:write`, `posts:write`, `openid`, `profile` and `offline_access`. Unrecognized scopes SHALL remain visible with a generic explanation. The page MUST NOT add permissions that were not requested.

#### Scenario: Client requests only read access
- **WHEN** the request contains `games:read library:read`
- **THEN** the page describes game reads, library entry reads and listing the user's collections
- **AND** it does not imply the client can change the user's library, reviews or posts

#### Scenario: Client requests writes and continued access
- **WHEN** the request includes `library:write reviews:write posts:write offline_access`
- **THEN** the page clearly describes adding/updating library entries, creating or replacing reviews, publishing posts and maintaining access without repeated sign-in

### Requirement: Explicit approval or denial
Consent SHALL require an explicit Authorize or Deny action. Authorize SHALL submit only the displayed requested scopes; Deny SHALL reject the request. Both actions SHALL use the original signed context and follow only the authorization server's successful response destination. The frontend MUST NOT construct callback URLs with authorization codes or OAuth errors from query parameters.

#### Scenario: User approves the request
- **WHEN** the user selects Authorize on a loaded consent page
- **THEN** approval is submitted with the signed authorization context and displayed requested scopes
- **AND** the browser follows the successful server-returned destination, including supported loopback or native-client callbacks

#### Scenario: User denies the request
- **WHEN** the user selects Deny
- **THEN** denial is submitted to the authorization server
- **AND** its returned callback communicates `access_denied` to the client without issuing a grant

#### Scenario: Submission is pending or fails
- **WHEN** a consent submission is pending or fails due to a transient network error
- **THEN** duplicate decisions are prevented while pending
- **AND** on failure the page reports the error without navigating or claiming success and permits an explicit retry

### Requirement: Invalid requests fail without unsafe redirects
Missing, malformed, expired or server-rejected authorization context and unavailable client metadata SHALL produce a recoverable error state. The system MUST NOT approve automatically, silently fall back to ordinary login success or navigate to a query-supplied callback. Restart instructions SHALL direct the user back to the requesting client or setup guide.

#### Scenario: Signed context was tampered with or expired
- **WHEN** the authorization server rejects the signed request on continuation or consent
- **THEN** no successful connection is shown and no query-supplied callback is followed
- **AND** the user is told to restart connection from their client

#### Scenario: Client metadata cannot be loaded
- **WHEN** the client is unknown, disabled or its public metadata cannot be retrieved
- **THEN** consent approval stays unavailable and a visible retry or restart action is offered

#### Scenario: Consent page loses its GameNode session
- **WHEN** the user reaches consent without a usable GameNode session
- **THEN** sign-in preserves the pending signed context
- **AND** after successful sign-in the server resumes that authorization before any decision is submitted

### Requirement: Mobile-originated flows use browser authorization
Users entering setup from mobile SHALL receive the same endpoint, scopes and authorization behavior as web users. OAuth login and consent SHALL complete on the canonical GameNode website in the provider/client-initiated browser flow. The mobile app MUST NOT forward its own session token to the assistant, website URL or clipboard, or require a separate mobile OAuth provider.

#### Scenario: Native user connects a hosted assistant
- **WHEN** the user opens Claude.ai or ChatGPT from the mobile guide and initiates its GameNode connection
- **THEN** the provider drives OAuth through the canonical website's login and consent pages
- **AND** the browser can require a separate GameNode sign-in without exposing or depending on the native app session

#### Scenario: GameNode app is installed during browser authorization
- **WHEN** an OAuth login or consent URL is intercepted by a GameNode app link
- **THEN** the original URL is reopened in the browser instead of navigating to a native sign-in or consent route
- **AND** the website does not show an open-in-app promotion on OAuth login or consent pages
- **AND** ordinary content deep links and native social sign-in callbacks retain their existing behavior

### Requirement: Accessible and private authorization pages
Login continuation and consent SHALL provide localized English and pt-BR loading, submitting and error states, accessible permission/action labels and responsive presentation. Tokens and signed authorization queries MUST NOT be added to application telemetry, analytics page URLs, copy actions or third-party outbound referrers.

#### Scenario: User opens a consent link containing OAuth context
- **WHEN** the consent page is rendered and an application or documentation link is followed
- **THEN** signed request values are excluded from analytics and the outgoing referrer
- **AND** visible error messages do not disclose raw authorization payloads or credentials

