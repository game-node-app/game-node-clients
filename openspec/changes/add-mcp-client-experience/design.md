# Design

## Context

See `proposal.md` for motivation and the two delta specs for user-visible behavior.

- This repository uses Next.js **Pages Router** for web and Ionic/Capacitor with React Router 5 for mobile. Shared React/Mantine components, auth and routing contracts already live in `@repo/ui`; English/pt-BR copy lives in `@repo/locales`.
- `PROJECT_CONTEXT.serverUrl` comes from `NEXT_PUBLIC_SERVER_URL` / `VITE_PUBLIC_SERVER_URL`, not the current browser origin. The existing theme uses Roboto, dark surfaces and orange `#F15025` brand accents.
- `SignInScreen` currently redirects any existing session to a safe relative `redirectTo` or home, and its web caller sends new users to `/wizard/init`. It does not preserve MCP authorization queries. `getSafeRedirectPath` must keep protecting ordinary redirects.
- Better Auth 1.7.14 is configured through explicitly typed `AuthClientOptions`, then wrapped by `withCapacitor` on native. Native API sessions are bearer-based; browser sessions use cookies. The in-progress `migrate-clients-to-better-auth` change already implements these paths.
- The server MCP change is implemented locally. Its canonical login and consent URLs are `${DOMAIN_WEBSITE}/auth` and `${DOMAIN_WEBSITE}/oauth/consent`. The MCP resource is `${DOMAIN_API}/v1/mcp`; the browser does not itself need to become an MCP client.
- Inspection of the server's installed `@better-auth/oauth-provider@1.7.14` confirms: `oauthProviderClient()` injects signed `oauth_query` into auth requests; `/oauth2/public-client` exposes consent-safe metadata; `/oauth2/consent` accepts `{ accept, scope, oauth_query }`; `/oauth2/continue` requires an explicit continuation discriminator. Both decision/continuation endpoints return `{ redirect: true, url }`.
- Signed queries contain `sig`, `exp`, `ba_iat`, repeated `ba_param` and potentially repeated `resource`. Converting them into a plain query object can lose values. `/oauth2/public-client` does not expose a separate verified-publisher flag.
- The web app mounts `PostHogProvider` globally. Its current initialization does not filter sensitive URL query values. OAuth routes require a narrow privacy guard before capture, rather than an effect that runs after page tracking.
- Android's manifest currently claims every HTTPS `gamenode.app` path. `AppUrlListener` maps these into tab routes, and the web `OpenInAppDialog` does not exclude `/auth` or `/oauth/consent`. These existing entry points must keep MCP authorization in the browser.

## Goals / Non-Goals

**Goals:** keep one source of truth for setup data, content and behavior; complete the existing server contract with minimal new frontend code; make setup useful without a GameNode session; preserve ordinary authentication and navigation.

**Non-Goals:** no frontend MCP SDK or token exchange, no AI chat, no invented provider installation protocol, no separate native authorization server, no new database/API, no admin setting, and no connection inventory or revocation panel. Consent is an explicit approve-all-displayed or deny decision; per-scope checkboxes are unnecessary for this first version.

## Decisions

### D1. One shared guide and one canonical consent surface

Add `McpGuideScreen` and its small configuration/prompt helpers under `packages/ui/src/components/mcp/`, exported through the existing component barrels. Put consent presentation/behavior beside shared auth. Web `/mcp` and mobile's tab-aware `/mcp` simply wrap the same guide with their normal layout. `/oauth/consent` is mounted by web and uses shared presentation; the API already routes every client there.

Mobile uses the provider's browser flow and may require a fresh browser sign-in to GameNode. It never forwards its bearer token into the browser. Native does not need a duplicate consent page or callback protocol; the requesting MCP client owns its registered callback.

Exclude web consent and signed OAuth login from `OpenInAppDialog`. At the existing native `AppUrlListener` boundary, recognize canonical GameNode HTTPS OAuth-login/consent URLs and reopen the original URL with Capacitor Browser instead of passing it through `getTabAwareHref`. Preserve all query values, ordinary content deep links and the `app.gamenode://` sign-in callback handling. This uses the current browser API and requires no broad App Link manifest rewrite.

**Alternative:** separate web/mobile screens or a WebView-specific OAuth flow. Rejected because both duplicate logic and create session/callback risks without improving the requested setup flow.

### D2. A compact GameNode + AI page

Use existing Mantine primitives, Tabler icons and the current theme, with limited CSS for layout:

1. **Overview:** GameNode logo, “GameNode + IA”, a brief value statement and three example requests (find a game, organize a backlog, draft a review/post). Compact labels distinguish reading from changing account data. The example text is illustrative, not a live chat or executable tool call.
2. **Choose your assistant:** four selectable cards for Codex, Claude Code, Claude.ai and ChatGPT. Show two columns on wider screens and a stacked layout on phones. Selection updates one instruction panel; it does not navigate away or duplicate panels.
3. **Setup panel:** three short stages—add server, sign in/authorize, verify. For terminal clients, show copyable commands. For hosted clients, show steps and **Abrir Claude.ai** / **Abrir ChatGPT** buttons. Explain beside these buttons that configuration continues at the provider. Keep both hosted-client actions easy to discover in the guide.
4. **Configure with an agent:** primary **Copiar prompt** action for the selected client, a short explanation, and expandable/selectable prompt content. Keep the action near the setup instructions; avoid a fixed footer that obscures Ionic controls.
5. **Manual setup:** an accordion with server name, URL/copy action, transport, OAuth/discovery information and client-specific config examples. Follow with concise troubleshooting for login expiration, missing provider permissions and unavailable clipboard access.

Web adds `/mcp` to public shell navigation and a link in the existing connections preferences screen; it is not treated as a Steam/PSN import connection. Mobile adds a preference row linking to the shared page through the current tab. No new preferences category or admin navigation is needed. On mobile the screen uses `AppPage withSearch={false}`, safe-area spacing and horizontally scrollable code blocks within the content width.

**Alternative:** a new dashboard/preferences category with connection status. Rejected because the server has no such status contract and a public guide should not require sign-in.

### D3. Environment-derived connection information and documented client flows

Build the MCP URL once from the configured server base URL with exactly one `/v1/mcp` suffix, preserving the API base path. Reuse it for all displayed commands, snippets and prompts. Do not accept arbitrary endpoint overrides from query parameters. The normal application configuration remains the only source.

Client instructions use these small templates, with the actual environment URL replacing `<MCP_URL>`:

- **Codex:** `codex mcp add gamenode --url <MCP_URL>`, then `codex mcp login gamenode`; inspect with `codex mcp list` or `/mcp`. Manual fallback is a `[mcp_servers.gamenode]` table with `url` in `~/.codex/config.toml`.
- **Claude Code:** `claude mcp add --transport http --scope user gamenode <MCP_URL>`, then `/mcp` to authenticate; verify with `claude mcp get gamenode`. Label user versus project configuration clearly; a manual project `.mcp.json` example contains `{ "mcpServers": { "gamenode": { "type": "http", "url": "<MCP_URL>" } } }`.
- **Claude.ai:** open `https://claude.ai/customize/connectors`; add a custom remote connector named GameNode, paste the endpoint, select the discovered OAuth configuration and connect. Prefer published identity/CIMD or automatic registration, without user-entered secrets. Explain organizational restrictions when relevant.
- **ChatGPT:** open `https://chatgpt.com/` or the official Plugins connection surface linked by its documentation; choose **Add custom MCP server**, enter the endpoint, choose OAuth and connect. Explain that setup availability depends on account/workspace policies and provider surface. Do not direct users to Custom GPT Actions or assume local Codex config configures ChatGPT.

These flows were checked against official documentation on 2026-10-31. No universal provider install deep link is established by these sources, so the accepted behavior is provider navigation plus instructions. Recheck official labels/links before implementation ships; avoid hard-coded plan/price matrices.

Official references:
- [Codex MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)
- [ChatGPT custom MCP server](https://developers.openai.com/api/docs/guides/custom-mcp-server)

**Alternative:** a generic `mcpServers` snippet for every client. Rejected because Codex uses TOML and hosted clients require their own graphical setup.

### D4. Copy helpers carry configuration, never authorization state

Use one small shared set of templates keyed by the four clients plus manual setup, backed by translated content. The setup prompt names the selected client, the actual resource URL, Streamable HTTP, OAuth 2.1 with discovery/PKCE and automatic client registration. It asks the receiving agent to inspect existing config, add/update only the GameNode entry, let the user complete browser authentication, then list tools and perform a read-only check. For hosted clients it explicitly asks for guided UI steps when the agent cannot configure them directly.

It must not suggest extracting GameNode cookies, pasting API/session tokens into chat, overwriting unrelated config or running writes to test setup. Include supported permissions as information about what the user will review; do not silently request broader authorization than the client needs.

Reuse Mantine's installed clipboard support, checking its actual result/error before showing success. A shared copy control can serve the prompt, URL, commands and config blocks. If writing is unavailable or rejected, show the same content in a selectable read-only field with a clear error. Use this fallback on native too; no new clipboard dependency is required. The mobile wrapper supplies only external opening via the installed Capacitor Browser API; web uses standard accessible external links. Report launch failures without clearing instructions.

**Alternative:** copy a token-bearing connection URL or add platform-specific content implementations. Rejected: setup only needs public data, and the existing WebView clipboard/fallback path can share behavior.

### D5. Reuse the pinned OAuth provider client and preserve signed context

Add the exact `@better-auth/oauth-provider@1.7.14` dependency to `@repo/ui` and register `oauthProviderClient()` alongside `adminClient()` in the existing shared auth options. Extend the explicit plugin type without losing the native wrapper or creating unnameable inferred declaration types (the reason `AuthClientOptions` exists). No backend `mcp()` plugin or MCP SDK belongs in the client bundle. The client hook is inert without signed query context; admin receives no new settings or UI.

Update `SignInScreen` at the shared root, giving pending OAuth context precedence over its ordinary session redirect and `newUserPath`. Preserve the raw signed query with `URLSearchParams` and the provider client's signed-parameter filtering, including repeated values; do not round-trip it through `Object.fromEntries` or a reconstructed allowlist of OAuth fields.

For social sign-in, let the plugin attach `oauth_query` so the server's existing post-sign-in hook resumes authorization. Supply error callbacks that retain this context, even when an `error` parameter is added. Fresh accounts follow the same continuation instead of `/wizard/init`. For an existing session, use the provider's continuation endpoint with its required discriminator (`selected: true`), not an empty continuation request or a frontend-built callback. Respect server-directed fresh login: if continuation returns the sign-in screen again, present providers instead of auto-resubmitting in a loop.

Use the server-returned continuation/decision URL as a full browser navigation. Do not run third-party callbacks through the same-origin router or relax `getSafeRedirectPath`. A callback may legitimately be a registered loopback/native URI; only the fixed, trusted API's successful response can supply it. The UI never exchanges authorization codes or stores MCP access/refresh tokens.

**Alternative:** reconstruct `/authorize` from an arbitrary return URL or loosen the redirect helper. Rejected because that weakens ordinary login and bypasses signed-context validation.

### D6. Consent is a small server-backed decision page

Wait for session resolution, preserve the signed request when login is needed, then fetch `/v1/auth/oauth2/public-client?client_id=...` through the configured auth client. This public-fields endpoint is usable by the authorizing user; `/get-client` is an owner-management endpoint and must not be substituted. Fetch no remote client images or arbitrary metadata documents from the browser.

Show the GameNode account, client name/identifier, an optional safe HTTPS client website, and the HTTPS `client_id` origin for a metadata-document client. The server is responsible for metadata discovery/validation. The public response has no publisher-verification flag: show “metadata document domain,” never a “verified by GameNode” badge. An opaque DCR identifier remains explicitly identified without a domain badge. Escape all text and render unsafe website URIs as text only.

Map scope explanations in shared translations: catalog reads, the user's library entry/collection reads, library changes, reviews, posts, basic identity/profile, and continuing access (`offline_access`). Display all requested scopes and separate changes visually from reads; use a neutral raw-scope fallback for future names. Approve sends the displayed requested scope string and signed context; deny sends `accept: false`. No per-scope toggles in this version.

Loading, missing metadata, invalid/expired context, lost session and network errors each get an explicit state. Disable both decisions during a submission, reject missing request structure before enabling approval, and rely on the server for cryptographic validation/expiration. A successful response alone triggers navigation. Retry transient failures; invalid/expired requests explain how to restart from the requesting client and offer the guide. There is no frontend-created `access_denied` callback.

### D7. Guard authorization URLs at existing telemetry boundaries

Set a no-referrer policy on web login/consent and `rel="noreferrer"` on outbound consent links. Configure the existing PostHog capture boundary to discard authorization-page events and scrub sensitive auth URLs/referrers before any initial or SPA capture, including events on the next page that refer back to an OAuth route. Suppress recording/autocapture of the consent surface and never log raw error responses, request bodies or signed queries. Keep this narrow to OAuth/login routes and their sensitive URL properties; no new analytics events are required.

**Alternative:** clean the address bar after render. Rejected because it both loses continuation context and runs too late to prevent initial telemetry leakage.

### D8. Concrete reach and validation

| Area | Required reach |
| --- | --- |
| Shared UI | New MCP guide/content/copy helpers and consent components; existing `authClient.ts` and `SignInScreen`; affected component barrels. Reuse routing contracts without broadening ordinary redirects. |
| Web | `pages/mcp.tsx`, `pages/oauth/consent.tsx`, the `/auth` caller, public shell navigation, `PreferencesConnectionsScreen` entry, `OpenInAppDialog` exclusions and route-level head/privacy integration. |
| Mobile | `pages/mcp.tsx`, `getCommonRoutes`, preferences entry, a Browser adapter and `AppUrlListener`/deep-link tests. Preserve tab-aware links/back behavior and native sign-in callbacks. |
| Locale/config | en/pt-BR JSON and generated types; `packages/ui/package.json` and Yarn lockfile for the pinned OAuth client. Existing API env values only. |
| Telemetry | `packages/analytics/src/PostHogProvider.tsx` and its web caller as needed for early suppression/sanitization. |
| Tests/fixtures | Existing mobile Vitest harness: signed-query and server-response fixtures, auth mocks, clipboard/browser failures, endpoint/template tests, consent interactions and ordinary login regressions. |
| Unchanged contracts | REST wrapper generation, existing server tools/scopes, session token storage, collection/review callers and admin configuration. Run admin type checks because auth types are shared. |

Use focused tests, not a second test framework. Critical assertions cover signature/repeated-resource preservation, new/existing-user continuation, denied/expired/tampered requests, unsafe redirects/metadata, scope display and decision payloads, successful versus failed clipboard writes, absence of secrets, mobile Browser use and telemetry URL suppression. Cross-platform layout/accessibility and real provider login need manual checks on a running stack; mocked tests cannot establish external compatibility.

## Risks / Trade-offs

- [Provider UI, account policies and install links change] → Link official instructions, keep provider data together and verify real client flows at release; do not promise a one-click connection or universal availability.
- [Native WebView and browser sessions differ, and App Links can intercept website auth] → Finish OAuth on the website, reopen intercepted authorization URLs in the browser and suppress app promotions; never transplant native session credentials. Verify this on Android with the app installed.
- [Shared auth changes affect admin or native login] → Preserve explicit auth types and test ordinary callbacks/return targets; admin gains no configuration.
- [A registered name/website can impersonate a brand] → Show the identifier/domain separately, escape metadata, and avoid verification badges inferred from names or client URIs.
- [The server spec's lockout prose is broader than its design] → The server design allows residual reads until access-token expiration while blocking writes/refresh immediately. This guide must not promise instantaneous revocation of all access; resolving that backend wording is outside this client change.
- [Clipboard support differs across WebViews] → Truthful success/error state and selectable fallback; test an Android device before claiming native clipboard support.
- [OAuth context can leak through global analytics] → Filter before capture and suppress recording on auth surfaces, including referrers on subsequent pages.

## Migration Plan

1. Base implementation on the existing Better Auth client migration and matching server plugin version. No data migration or new environment secret is needed.
2. Deploy the server's MCP capability before exposing connection instructions. Deploy canonical web `/auth` continuation and `/oauth/consent` with the guide so every external client can complete authorization.
3. Check the flow with Codex, Claude Code and the two hosted clients on a deployed HTTPS stack: sign in, inspect consent, deny/retry, approve, list tools and run one read-only query. Record actual account restrictions and failures.
4. Ship mobile guide/navigation in the normal mobile release; verify Browser opening, back navigation, clipboard success/fallback and the hosted website authorization on a device.
5. Roll back with the previous client build if needed. No stored user data changes. Existing OAuth grants remain server-owned; rollback removes new connection UI and can prevent new consent flows, so coordinate with the server deployment rather than claiming grants were revoked.
