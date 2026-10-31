# Spec Delta

## Purpose

Help GameNode users discover what an assistant can do with their account and configure the GameNode MCP server through a consistent guide on web and mobile.

## ADDED Requirements

### Requirement: Public and discoverable setup guide
The system SHALL provide a public `/mcp` guide on web and an equivalent tab-aware page on mobile. Web navigation and preferences, and mobile preferences, SHALL link to it. Reading the guide or copying setup information MUST NOT require GameNode sign-in.

#### Scenario: Visitor opens the guide directly
- **WHEN** a signed-out visitor opens `/mcp` on web
- **THEN** the guide renders without redirecting to login
- **AND** the visitor can read client instructions and copy configuration or the setup prompt

#### Scenario: Mobile user enters from preferences
- **WHEN** a mobile user opens GameNode + AI from preferences
- **THEN** the guide opens within the current tab
- **AND** back navigation returns to the originating page

### Requirement: Explain the supported assistant actions
The guide SHALL explain game search/details, library entry reads and collection listing, adding games to the library, reviews and posts. It SHALL distinguish reads from changes to the account and provide practical example requests. It MUST NOT advertise unsupported tools or imply setup grants permissions automatically.

#### Scenario: User evaluates the integration
- **WHEN** a user reads the guide overview
- **THEN** examples illustrate discovery, library organization and writing a review or post
- **AND** the page explains that available actions depend on the permissions the user authorizes

### Requirement: Client-specific setup instructions
The guide SHALL offer instructions for Codex, Claude Code, Claude.ai and ChatGPT, including configuration, browser authorization and a way to verify connection. It SHALL link to official documentation and explain provider account/workspace or platform restrictions without promising universal availability.

#### Scenario: User selects a command-line client
- **WHEN** the user selects Codex or Claude Code
- **THEN** the guide shows the corresponding HTTP MCP setup command, authentication step and a connection check
- **AND** the copied instructions use the current environment's GameNode endpoint

#### Scenario: User selects a hosted assistant
- **WHEN** the user selects Claude.ai or ChatGPT
- **THEN** the guide explains how to add a remote MCP connection and complete OAuth in that service
- **AND** it explains that account permissions or the provider's web surface can limit setup

### Requirement: Launch hosted assistants
The guide SHALL provide Open Claude.ai and Open ChatGPT buttons leading to the provider's connection surface or its official entry page with visible next steps. A direct setup shortcut SHALL be used only when officially supported. Launching a provider MUST NOT be represented as successful connection or as GameNode social sign-in.

#### Scenario: User needs to sign in at the provider
- **WHEN** the user activates either hosted-assistant button
- **THEN** the provider opens so the user can sign in and follow the connection instructions
- **AND** the GameNode page remains available without showing a fabricated connected state

#### Scenario: Launch fails on mobile
- **WHEN** the mobile browser cannot open the provider URL
- **THEN** the guide reports the failure and keeps the URL and instructions available for manual use

### Requirement: Environment-correct manual configuration
The guide SHALL show a copyable GameNode server name, MCP URL, Streamable HTTP transport and OAuth authentication instructions. It SHALL offer Codex TOML and Claude Code HTTP JSON examples, clearly label their target client, and explain discovery-based client registration. Configuration MUST NOT require copying session credentials, API keys or client secrets.

#### Scenario: User copies staging configuration
- **WHEN** the client is configured for a staging API
- **THEN** the endpoint, commands, configuration examples and setup prompt all use that API's `/v1/mcp` endpoint exactly once
- **AND** none falls back to the production domain or the mobile WebView origin

#### Scenario: User configures another compatible client
- **WHEN** the user expands manual setup
- **THEN** the guide provides the endpoint, transport, OAuth discovery information and supported permissions
- **AND** explains that browser login and consent are required and no manual secret is supplied

### Requirement: Copy an actionable setup prompt
The guide SHALL provide Copy prompt for the selected client, including a generic manual-client option. The localized prompt SHALL name GameNode, include the environment's endpoint, Streamable HTTP and OAuth discovery, and ask an agent to preserve existing configuration, configure only GameNode, leave login/consent to the user and verify using a read-only action.

#### Scenario: Agent receives the copied prompt
- **WHEN** the user copies the prompt for Codex
- **THEN** the clipboard contains a complete Codex-targeted setup request with the actual MCP URL and supported authentication instructions
- **AND** the prompt tells the agent to preserve unrelated entries, use the client's normal credential storage and avoid requesting credentials in chat
- **AND** it does not authorize creating posts, changing the library or overwriting reviews as a setup check

#### Scenario: Selected client requires graphical setup
- **WHEN** the user copies a prompt for Claude.ai or ChatGPT
- **THEN** it asks the agent to guide the user through the provider's supported configuration flow if direct configuration is unavailable
- **AND** it does not claim a local config file configures the hosted service

### Requirement: Truthful clipboard feedback and fallback
Copy actions SHALL report success only after a successful clipboard write. If clipboard access is unavailable or denied, the system SHALL show an error and expose the exact requested content as selectable text for manual copying. Copied data MUST NOT contain account identifiers, session tokens, OAuth state or other authorization-request values.

#### Scenario: Clipboard access is denied
- **WHEN** the user presses Copy prompt or a configuration-copy action and clipboard writing fails
- **THEN** no success confirmation is shown
- **AND** the user can select and copy the same complete content manually, including on mobile

### Requirement: Consistent accessible experience across platforms
The guide SHALL use GameNode's existing colors, typography and component presentation, support English and pt-BR, and expose equivalent content/actions on web and mobile. Client selection, launch and copy controls SHALL be keyboard accessible and labeled, with readable code blocks, visible feedback and a layout that fits narrow screens.

#### Scenario: User reads the guide on a narrow screen
- **WHEN** the guide is displayed at a phone viewport in either supported language
- **THEN** cards and actions fit the viewport and long code/URLs do not cause page-level horizontal overflow
- **AND** the same clients, manual information and setup prompt remain available

#### Scenario: Keyboard user selects and copies instructions
- **WHEN** a keyboard user changes the selected client and invokes Copy prompt
- **THEN** focus remains usable and the copy result is announced accessibly

