# Design

## Context

Motivation: see proposal.md, Why. Requirements: see the two spec deltas.

What shapes the approach:

- **The server's `server_swagger.json` already has `nintendo` and `1002`.** It is on game-node-server's `feat/add-nintendo-connection` branch. The server tasks are all done except the manual end-to-end run (6.3).
- **Provider names are centralized.** `getConnectionName` is the one source of display names. `ImporterScreen` and both notification renderers in `AggregatedNotification.tsx` use it, so one `NINTENDO` branch covers the importer, reauth notifications and import notifications. Icons come from `getServerStoredIcon(type)`, which reads `/icons/nintendo.png` from the server.
- **`PreferencesConnectionDelegatedCode` is Epic-shaped, even though it is generic by type.**
  - `CODE_PATTERN = /[0-9a-f]{32}/i` would reject every Nintendo link. The link has a JWT `session_token_code`, and its only hex run is the 16 characters in `npf5c38e31cd085304b`.
  - The `Code` preview shows Epic's JSON page.
  - `copyHint`, `pasteLabel`, `pastePlaceholder` and `invalidCode` describe Epic's page.
- **The server checks the link in this order:** prefix `npf5c38e31cd085304b://auth#`, then `session_token_code` in the fragment, then fragment `state` equal to the saved state (server design D3). Any failure is an HTTP 400, after the state was already consumed. The state is a hex string, so it appears verbatim in the link.
- **`getConnectionProfileURL` feeds `<Anchor href>`** in `ProfileUserInfoConnections`. An `undefined` href renders the icon without a link.
- **Admin's `getExternalSourceName` humanizes the enum key.** `NintendoTitleId` would come out as "Nintendo Title Id". `getExternalLookupUrl` already returns `undefined` for unknown categories, and the table disables the visit action in that case.

## Goals / Non-Goals

**Goals:**

- Nintendo works end to end on web and mobile with Epic's flow, its state handling and its tests unchanged.
- No pasted Nintendo text the server would reject for format or state reaches the server.

**Non-Goals:**

- A provider registry or config object for delegated-code providers. There are two of them, so a conditional is enough.
- Moving the format check into a shared package for the server to reuse.

## Decisions

### D1. Branch on `type` inside `PreferencesConnectionDelegatedCode`

Add `const isNintendo = type === UserConnectionDto.type.NINTENDO`, then branch on it in three places:

- the local check;
- the `Code` preview;
- the translation keys for the hint, label, placeholder and error.

The Nintendo notice (D4) goes in the sign-in step. Everything else stays shared: the stepper, opener, clipboard button, mutation, failure lock and "Start over".

*Alternative: a `DELEGATED_PROVIDERS` record keyed by type, with a `check`, a `preview` and an i18n prefix.* Rejected for now: it is more code for two entries. Upgrade when a third delegated provider arrives.

### D2. Nintendo local check mirrors the server's parse

```ts
const NINTENDO_LINK_PREFIX = "npf5c38e31cd085304b://auth#";
// Mirrors the server's parse; a rejected callback burns the state.
function checkNintendoLink(value: string, state: string) {
  const text = value.trim();
  if (!text.startsWith(NINTENDO_LINK_PREFIX)) return "invalid";
  const params = new URLSearchParams(text.slice(NINTENDO_LINK_PREFIX.length));
  if (!params.get("session_token_code")) return "invalid";
  return params.get("state") === state ? "ok" : "otherAttempt";
}
```

The two errors get different messages:

- `invalid`: no link was found.
- `otherAttempt`: the link came from an earlier sign-in. This is the likely mistake when someone copies a link, starts over, and pastes the old one.

The text is still sent trimmed and unchanged. The server stays the authority.

*Alternative: check only the prefix, like Epic's loose check.* Rejected: the state comparison is one line, and without it a stale link burns the state.

### D3. Nintendo preview

A `Code block` reading `npf5c38e31cd085304b://auth#session_token_code=…&state=…`, with the whole link wrapped in `Mark`. The whole link is what the user copies, unlike Epic, where only one field is highlighted. The `IconArrowsLeftRight` header and the sign-in button stay as they are, and they already show the Nintendo icon by type.

### D4. Copy and keys

New keys go under `preferences.delegatedCode.nintendo`:

- `copyHint`: after signing in, right-click or long-press "Select this account", then "Copy link address". Don't click it.
- `pasteLabel`: "Account link".
- `pastePlaceholder`: `npf5c38e31cd085304b://auth#…`.
- `invalidLink`, `otherAttempt`.
- `coverage`: Switch and Switch 2 games played since the account was linked to a console. Not hidden or unplayed games. Playtime and dates come from Nintendo.
- `revoke`.
- `phoneHint`.

Add them to `en.json` and `pt-BR.json`, then run `yarn locales:generate-types`.

These keys are Nintendo-only, so they take no `{{type}}`. The shared keys `signInStep`, `signInButton`, `pasteStep`, `expiryHint` and `startOver` already fit Nintendo, whose code also expires in 10 minutes.

`revoke` copy must be verified before shipping. Before writing the string, check accounts.nintendo.com for a page that lists or revokes signed-in apps.

- If one exists, name it.
- If not, say what is true: removing the connection in GameNode deletes the stored Nintendo credentials (`user_connection_credential` cascades on delete). Then point the user to Nintendo Account's sign-in and security settings.

Do not claim that a password change revokes the session until that is verified.

### D5. Presentation branches

| File | Change |
| --- | --- |
| `getConnectionName.ts` | `NINTENDO → "Nintendo"` |
| `getConnectionProfileURL.ts` | `NINTENDO → undefined`. The return type widens to `string \| undefined`. Its only caller passes the result to `Anchor href`. |
| `ImporterScreen.tsx` | `"nintendo"` added to `VALID_SOURCES` |
| mobile `PreferencesConnectionsItems.tsx` | `<PreferencesConnectionItem type={NINTENDO} />` after Epic Games |

On native, the mobile opener already uses `Browser.open`, so Nintendo needs no new opener.

### D6. Admin

- Add `NintendoTitleId = 1002` to `EGameExternalGameCategory`.
- In `getExternalSourceName`, add `.replace(/\bId\b/, "ID")` next to the `Us → US` fix.
- `getExternalLookupUrl` needs no change. Nintendo falls to `default → undefined`, which disables the visit action and leaves the Match dialog's URL empty.
- Extend `getExternalLookupUrl.test.ts` with:
  - the `1002` label "Nintendo Title ID";
  - `undefined` as its lookup URL.

*Alternative: link a community title-ID database.* Rejected: the well-known ones are tied to piracy tooling, and an admin can paste the eShop page they find.

## Risks / Trade-offs

- **[Copying "Select this account" from Chrome Custom Tabs or SFSafariViewController fails, or the long-press opens the `npf…` scheme]** → The phone hint tells users to link from a computer. Task 5.2 checks this once on Android and once on iOS, and records the result here. If copying doesn't work on either platform, consider hiding the Nintendo list item on native in a follow-up rather than shipping a dead end.
- **[The client and server parses drift]** → Both follow the documented prefix and fragment. If the client check is wrong, it only blocks or lets through. The server stays the authority and returns 400 in any case.
- **[Admins must type a source URL for every Nintendo match]** → Accepted. The MCP mapping tools are the main path for bulk Nintendo mapping (server proposal), and the admin dialog is the manual fallback.
- **[`connection-onboarding` and `external-game-mapping-admin` exist only in the unarchived `add-epic-games-connection` change]** → Archive Epic first. `openspec validate` already warns that archive would refuse the MODIFIED delta otherwise.

- **[The regenerated wrapper also carries the server's paginated `GET /v1/game/external/unmapped`]** → Admin's `useUnmappedExternalGames` now reads `.data` of one 500-row page and uses `UnmappedExternalGameDto`. No server paging or dismiss UI yet; revisit when the queue outgrows one page.

## Migration Plan

**Ship the clients before, or together with, the server.** Today's web builds its connections list from `GET /v1/connections`, so a deployed server makes Nintendo appear there. Opening it calls `getConnectionName("nintendo")`, and ts-pattern's `.exhaustive()` throws at runtime on an unmatched value. Nintendo import notifications would hit the same throw. Server design's Migration Plan step 2 ("clients without the hand-off still show it through the generic paste box") is therefore wrong. The new clients are safe against the old server, where `nintendo` is simply absent.

1. Archive this repo's `add-epic-games-connection`.
2. Release web, admin and mobile. OTA is fine for mobile, because there is no native change.
3. Deploy game-node-server's `add-nintendo-connection`.

Rollback: revert the server first, then the clients if needed. Reverting only the client would bring back the `.exhaustive()` throw for any user who already has a Nintendo connection.

## Open Questions

- The exact Nintendo Account menu for revoking app sign-ins (D4). 
  - Found: Nintendo's support pages describe "Services with Access to Account Information" (Privacy/Other settings → Revoke permission), but that is the list for third-party services using Nintendo Account sign-in. Not verified that this link flow appears there, so the `revoke` copy only says that removing the connection in GameNode deletes the stored credentials.
