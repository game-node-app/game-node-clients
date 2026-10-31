# Proposal

## Why

The server change `game-node-server/openspec/changes/add-mcp-server` provides GameNode tools through MCP, but users cannot finish connecting until the website implements OAuth login continuation and consent. Web and mobile also need an approachable, consistent place to discover the integration and configure their preferred assistant without handling credentials manually.

## What Changes

- Add a public, responsive `/mcp` guide, presented as **GameNode + AI**, using the existing GameNode theme and shared UI. Explain supported actions through concrete examples, followed by client setup and manual connection details.
- Cover Codex, Claude Code, Claude.ai and ChatGPT with client-specific instructions, copyable commands/configuration, official documentation links and clear guidance when the provider requires a particular account permission or browser surface.
- Provide **Open Claude.ai** and **Open ChatGPT** actions that take users to the provider's connection surface, where they sign in and add/connect GameNode. As confirmed by the user, these actions guide connection and use a direct installation shortcut only if officially supported; opening a service does not claim a connection succeeded.
- Add **Copy prompt**, containing the environment's MCP URL, transport, OAuth requirements and instructions for an agent to configure the selected client while preserving existing configuration and leaving login/consent to the user. Include visible/selectable content when clipboard access fails.
- Implement the companion `/oauth/consent` website page: identify the requesting application, show the active GameNode account and requested permissions, and accept or deny through the existing Better Auth provider.
- Preserve the signed OAuth authorization context through social sign-in, first sign-in, existing sessions and retries, while keeping ordinary login return-path protections.
- Make the guide discoverable from web navigation/preferences and mobile preferences. Share guide content, prompt/configuration generation, consent presentation and OAuth behavior in `@repo/ui`; app-specific code is limited to routing, layout and platform operations. Native connections use the canonical website in the external browser.

Out of scope: admin screens/settings, server changes, an embedded AI chat or MCP runtime in the frontend, API keys, new social login providers, connection-status detection, connected-app management/revocation UI, additional tool capabilities and marketplace publication.

## Capabilities

### New Capabilities

- `mcp-setup-guide`: shared discovery and setup experience, provider launch actions, manual configuration and safe clipboard prompts across web and mobile.
- `mcp-user-authorization`: client-side completion of GameNode MCP OAuth login and consent, application identity, permission disclosure, denial and failure handling.

### Modified Capabilities

None. Main specs currently cover blog behavior only. This change extends the shared login implementation introduced by the in-progress `migrate-clients-to-better-auth` change, preserving its ordinary `client-auth` behavior rather than duplicating that capability.

## Impact

- **Shared UI:** `packages/ui/src/components/auth/`, new MCP components/content, component barrels, `UIProvider` integration where platform behavior is needed, and existing theme/clipboard/error components.
- **Apps:** Next.js Pages Router pages for `/mcp` and `/oauth/consent`, web navigation/preferences entry points and OAuth exclusions in the open-in-app dialog; Ionic common/tab-aware `/mcp` routes, mobile preferences entry, external-browser adapter and handling of intercepted OAuth App Links. No admin feature or configuration.
- **Locales:** English and pt-BR translations, including setup, prompt, scopes and errors, plus generated locale types.
- **Dependencies/API:** consume the existing `/v1/auth/oauth2/*` contract with the matching `@better-auth/oauth-provider@1.7.14` client plugin; reuse Better Auth sessions. No new REST/MCP tools or wrapper regeneration is expected. MCP URL derives from existing public server configuration.
- **Validation:** focused tests using the mobile workspace's existing Vitest harness for shared behavior and platform boundaries; lint/type checks for affected workspaces and an admin regression check for shared auth typing. Real OAuth/provider and native clipboard/browser checks require a running stack and the corresponding clients/devices.
- **Release dependency:** deploy with the server MCP change and the Better Auth client migration; website login/consent is the canonical authorization surface for desktop and mobile-originated flows.
