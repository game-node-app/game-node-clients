# Design

## Context

Motivation: see proposal.md, Why. Requirements: see `specs/connection-onboarding` and `specs/external-game-mapping-admin`.

What shapes the approach:

- **Connection setup is one shared component.** `packages/ui/.../connections/PreferencesConnectionSetup.tsx` renders inside `PreferencesConnectionModal` on web and on mobile. It already branches on `authMode` (`redirect` / `public_identifier`) and takes an `onRedirect` prop, which mobile sets to `Browser.open` on native. The web connections list is data-driven from `GET /v1/connections`; mobile's `PreferencesConnectionsItems.tsx` hardcodes the three providers.
- **The server already parses the pasted code.** `parseEpicCode` (game-node-server `src/sync/epic/epic-connection-auth.provider.ts`) accepts a raw 32-hex code or the JSON page body containing `authorizationCode`, and returns 400 for anything else.
- **The state is consumed before the code is checked.** `ConnectionsService.completeRedirectAuth` calls `consumeState` before the strategy's `completeRedirectAuth`, so every failed callback, including a typo, needs a new init.
- **Epic never redirects back.** The existing `ConnectionAuthCallback` route stays limited to Steam and Xbox.
- **The wrapper is generated.** `packages/wrapper/input/server_swagger.json` is behind the server: it lacks `epicgames`, category `1001`, `origin` and `fill/epic`. Regenerating breaks two exhaustive `ts-pattern` matches, `getConnectionName` and `getConnectionProfileURL`, which is how they are meant to catch new providers.
- **The fill endpoint has no response schema in Swagger.** The controller returns `{ jobId, state }`, but the generated method is typed `any`.
- **Admin pieces to reuse:**
  - the `UnmappedExternalGamesTable` built with `mantine-react-table`;
  - `GameSearchSelectModal` from `@repo/ui`, already used by awards;
  - the `useCustomTable` hook;
  - the admin `EGameExternalGameCategory` enum and `getExternalSourceName`, which derives labels from enum keys.
- **Colors are constrained by AGENTS.md.** `brand`, `secondary` and `tertiary` are flat palettes. No per-app palettes and no ad-hoc `bg-*`/`c=` overrides. Use `variant="light"` with the brand color or stock Mantine colors.

## Goals / Non-Goals

**Goals:**

- One delegated-code flow in `@repo/ui` that serves both web and mobile and works for any future `delegated_code` provider. Only the copy is Epic-specific.
- A flow that can't burn the single-use state on an obviously bad paste.
- Admins can resolve every unmapped Epic namespace without leaving the admin app.

**Non-Goals:**

- Polling the bulk fill's progress, since the server exposes no status endpoint.
- Showing mapping `origin` in admin lists.
- A countdown for the 10-minute state TTL. Static copy says it expires; a failure offers "Start over".

## Decisions

### D1. Delegated-code mode lives inside `PreferencesConnectionSetup`, with the paste step in its own component

The existing form already owns the auto-import settings that init must bind. For `delegated_code`:

- Submitting the form (with no connection yet), or selecting "Reconnect" (with one), calls `connectionsControllerInitRedirectAuthV1`, which `redirectMutation` already wraps. The result is stored as `{ state, authorizationUrl }` instead of being navigated to.
- While that pending auth exists, the setup renders `PreferencesConnectionDelegatedCode` (new, same folder) instead of the form.
- The `auth/init` call stays the same; only what happens to its result changes.
- The unsupported-mode guard adds `DELEGATED_CODE` to its allow-list.

*Alternative: a separate modal or route for delegated providers.* That would duplicate the settings form and the connected-state actions. Rejected.

### D2. Opening the sign-in URL

- The paste step shows a dedicated "Open Epic Games sign-in" button that calls `onRedirect ?? ((url) => window.open(url, "_blank", "noopener,noreferrer"))`.
- The redirect flow keeps its own fallback (`window.location.assign`). The prop's default value moves into each call site, so the two modes fall back differently without a new prop.
- The URL opens on its own click, not in the same tick as the awaited init, so web popup blockers don't fire.
- Mobile native already passes `Browser.open`, which shows the in-app browser and keeps the modal mounted underneath.

*Alternative: open the URL automatically right after init.* Safari blocks `window.open` after an `await`. Rejected.

### D3. Paste validation is a presence check; the server parses

- The client sends `value.trim()` as `callbackParams.code`.
- Before sending, it checks `/[0-9a-f]{32}/i.test(value)`: one line that rejects empty and obviously wrong pastes, which would otherwise consume the state.
- The server stays the authority on what counts as a valid code.

*Alternative: parse the JSON client-side and send only the code.* That duplicates `parseEpicCode` and gains nothing. Rejected.

### D4. Failure resets to the settings step

- Any callback error shows inline and offers "Start over", which clears the pending auth.
- The paste input and submit are disabled after a failure, so a consumed state is never resent.
- On success: invalidate `["connections"]`, notify with `getConnectionName(type)`, and close.
- `getConnectionName` replaces `getCapitalizedText(type)` in this component's notifications. That keeps the copy consistent ("Epic Games", not "Epicgames") and is a small improvement for PSN and Xbox too.

### D5. Visual design

- **Header.** A connector strip shows the GameNode mark and the Epic icon (`getServerStoredIcon("epicgames")`) joined by an `IconArrowsLeftRight`, so the user sees which two accounts are being linked.
- **Steps.** A Mantine `Stepper` with two steps, "Sign in to Epic Games" and "Paste your code". It uses the default primary `brand` color: the GameNode orange marks progress.
- **Two kinds of action.**
  - Actions that leave GameNode for Epic ("Open Epic Games sign-in") use `color="dark"`, a stock Mantine color, with the white Epic icon on the left. This matches Epic's own monochrome identity, so users recognize the hand-off.
  - Actions that complete inside GameNode ("Connect", "Continue") use the default brand color.
  - No Epic palette is added, which keeps to AGENTS.md.
- **What to copy.** Mantine `Code block` shows a preview of the page Epic displays: `{ …, "authorizationCode": "` **`a1b2…`** `", … }`. The code part is wrapped in `Mark` with `color="brand"` (light variant). Users see exactly what to copy; the copy line says pasting the whole page also works.
- **Paste field.**
  - A monospace `TextInput` (`ff="monospace"`).
  - A right-section `ActionIcon variant="light"` with `IconClipboard`, rendered only when `navigator.clipboard?.readText` exists. It fills the field from the clipboard.
  - The inline error comes from the presence check (D3).
- **Expiry hint.** A dimmed line: "This sign-in expires in 10 minutes."
- **Copy.** All strings live in `en` and `pt-BR` under `preferences.delegatedCode.*`. The text names the provider through `{{type}}`, so a future delegated provider only needs its name.

### D6. Epic as a first-class connection

- `getConnectionName`: `EPIC_GAMES → "Epic Games"`.
- `getConnectionProfileURL`: `EPIC_GAMES → https://store.epicgames.com/u/<sourceUserId>`, Epic's public profile page keyed by account ID.
- `ImporterScreen`:
  - `VALID_SOURCES` adds `"epicgames"`;
  - `sourceName` uses `getConnectionName` for valid sources instead of capitalizing the slug.
- Mobile `PreferencesConnectionsItems` adds `EPIC_GAMES`.
- No changes are needed on the web connections list, the importer index on web and mobile (both data-driven), or the landing page (already shows Epic).

### D7. Admin: lookup URL helper, Match modal, fill panel

- **Category labels.** `EGameExternalGameCategory` adds `EpicGamesNamespace = 1001`. `getExternalSourceName` derives "Epic Games Namespace" automatically.
- **Lookup URL.** One `getExternalLookupUrl(item)` replaces `onVisitClick`'s match:
  - Steam: `steamdb.info/app/<id>`;
  - Epic namespace: `egdata.app/sandboxes/<namespace>` (an Epic namespace is a sandbox ID);
  - anything else: `undefined`, which disables the action (replacing the `alert`).
  The same helper prefills the Match modal's source URL.
- **Match modal** (`MatchExternalGameModal`, new):
  - Shows the source chip (name and ID) and a "Choose game" button that opens `GameSearchSelectModal`.
  - The chosen game is shown with `useGame` and the cover figure.
  - The source URL `TextInput` is validated with `URL.canParse`.
  - Submit calls `externalGameControllerSubmitExternalGameV1`.
  - On success: notify and invalidate the unmapped query.
  - An `ApiError` with status 409 shows a specific inline `Alert color="yellow"`. Other errors use `createErrorNotification`.
- **Fill panel** (`EpicNamespaceFillPanel`, new), shown above the table:
  - a `Paper` with a light brand `ThemeIcon` (`IconWand`), a title, a two-line explanation and a "Run Epic namespace fill" button;
  - after a trigger, a `Badge` with the state, in stock colors: `active` blue, `waiting`/`delayed` yellow, `completed` teal, `failed` red;
  - the job ID in `Code`;
  - for `active` or `waiting`, a text line saying a run is already in progress.
  The response is cast to `{ jobId: string; state: string }` with the comment `shortcut: Swagger has no response schema for fill/epic, add an ApiResponse DTO on the server and regenerate`.

## Risks / Trade-offs

- **Copying the code on mobile.** Epic shows raw JSON, and long-press selection in the in-app browser is fiddly. → Pasting the whole page is accepted, and the clipboard button helps. Revisit if support requests show up.
- **`egdata.app` is a third-party site** and could change its URL scheme. → It is isolated in one helper, and the action is just a link. SteamDB is already a third-party precedent.
- **Epic profile URL pattern** (`store.epicgames.com/u/<id>`) is assumed from Epic's public profiles. → It is only used as a profile link. If it is wrong, the link 404s and nothing breaks.
- **Old server.** If clients deploy before the server, `epicgames` never appears in `GET /v1/connections`, so nothing breaks. The mobile hardcoded entry would show "Not connected", and connecting would hit "connection unsupported" because the provider isn't listed. → Deploy the server first.
- **Regenerating the wrapper** also pulls in unrelated server Swagger drift (a `Post` response schema). → Accepted; the typecheck in tasks catches any fallout.
