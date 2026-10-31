# Design

## Context

See proposal.md (Why) and the server change `game-node-server/openspec/changes/archive/2026-10-31-migrate-auth-to-better-auth`. Current state of the clients:

- **Web** (Next Pages Router, `:3000`): `SuperTokensProvider` wraps the app with `SessionAuth requireAuth={false}` and uses `tokenTransferMethod: "header"`. SuperTokens patches `fetch`, so the generated `@repo/wrapper` client (`fetch`, `WITH_CREDENTIALS = true`) gets the header without knowing it. `/auth` renders the prebuilt `AuthPage`. `/auth/callback/[[...provider]]` calls `signInAndUp()`. `/auth/logout` calls `signOut()`. New users go to `/wizard/init`.
- **Admin** (Next, `:3001`): the same provider, plus prebuilt routing in `pages/auth/[[...path]].tsx` and `SessionAuthWithRoles` with `UserRoleClaim`.
- **Mobile** (Ionic + Vite, `:3002` on the web, Capacitor on native): the same recipes, `websiteBasePath: "/m/auth"`, and a Preferences-backed `capacitorCookieHandler`. On native, the OAuth redirect URI is the app link `https://gamenode.app/m/auth/callback/<provider>` (Android `autoVerify` intent filter on `gamenode.app`). `AppUrlListener` routes `/m/auth*` into the app.
- **packages/ui**: about 15 components import `SessionAuth`/`useSessionContext`/`redirectToAuth` from `supertokens-auth-react`. `UIProvider` already injects a router hook (`useHooks().useRouter`). `usePostHogUserListener` already identifies users by id, so the `posthog.identify` calls in the SuperTokens providers are redundant.
- **Server after migration**: Better Auth at `${DOMAIN_API}/v1/auth`. `POST /sign-in/social {provider, callbackURL, errorCallbackURL, newUserCallbackURL}` returns `{url, redirect}`. The provider callback sets the `better-auth.session_token` cookie on the API host and redirects to `callbackURL`, or to `errorCallbackURL?error=<code>`. The `bearer()` plugin accepts `Authorization: Bearer`, and the admin plugin puts `role` (comma-separated) on `user`. `trustedOrigins` is only `[DOMAIN_WEBSITE]`, and CORS already allows credentials, `authorization` and exposes `set-auth-token`.
- **Error codes** observed in `better-auth@1.7.14` callback redirects: `account_not_linked`, `email_not_found`, `banned`, `access_denied` (provider), `state_mismatch`, `please_restart_the_process`, `no_code`, `oauth_provider_not_found`, `user_creation_failed`, `unable_to_link_account`, `internal_server_error`.
- **`better-auth-capacitor@0.4.0`** (MIT, single maintainer, ~1,150 lines, a Capacitor port of Better Auth's official Expo plugin). The server `capacitor()` plugin adds `GET /capacitor-authorization-proxy` (sets the state cookie inside the auth session, then redirects to the provider), turns off the JSON `redirect` flag for requests carrying `capacitor-origin`, and on `/callback/*` redirects to a trusted non-http origin appends `?cookie=<set-cookie>`. The client `capacitorClient({ scheme })` (via `withCapacitor()`) rewrites relative `callbackURL`/`errorCallbackURL`/`newUserCallbackURL` to `<scheme>://…`, opens the proxy URL in a native auth session (Custom Tabs / ASWebAuthenticationSession plugin shipped with the package), stores the returned cookie in Preferences, sends it as `Authorization: Bearer` with `credentials: "omit"`, notifies `$sessionSignal`, and clears storage on `/sign-out`. It ignores the error code when the session returns without a cookie. Peers: `better-auth`, `@better-auth/core`, `@capacitor/core`, `@capacitor/preferences` (>= 6), optional `@capacitor/app`. Built against `better-auth@1.6.23`; the hook fields it uses (`context.returned`, `responseHeaders`) exist in 1.7.14.
- **Brand**: `DEFAULT_MANTINE_THEME` (`primaryColor: brand`, `#F15025`, Roboto, dark), the Tailwind `brand` and `paper` scales in `packages/config-tailwind`, the landing (`apps/web/src/components/landing/Landing.module.css`): page `#0B0B0B`, cards `#090909` with a `#292929` border and 12px radius, text `#FAFAFA` / muted `#A6A6A6`, eyebrow `brand-6`, footer gradient `linear-gradient(90deg, #f15025, #d42912 56%, #5c0b06)`, and `GameNodeLogo` in `@repo/ui`.

## Goals / Non-Goals

**Goals:**
- One auth client and session layer in `packages/ui`, shared by all three apps. Call sites keep `SessionAuth`, `useUserId`, `useUserRoles` and `SessionAuthWithRoles` with the same props, so most files only change an import.
- One sign-in screen component, rendered by each app's route.
- Use Better Auth's client wherever it covers the flow. No hand-written `fetch` calls to `/v1/auth`.

**Non-Goals:**
- Server-side session reading in Next SSR. No page reads the session in `getServerSideProps` today.
- iOS setup (no iOS project in the repo). The library supports iOS through ASWebAuthenticationSession once an iOS project registers the `app.gamenode` scheme.
- Native device testing (deferred by the user).

## Decisions

### 1. Shared auth client in `packages/ui`, configured by each app
`packages/ui/src/components/auth/authClient.ts` exports `setupAuthClient(options)` and a module-level `authClient`. The base options are `{ baseURL, basePath: "/v1/auth", plugins: [adminClient()], fetchOptions: { credentials: "include" } }`, and `createAuthClient` receives them as given by the app. Mobile wraps those options in `withCapacitor(options, { scheme: "app.gamenode", storagePrefix: "gamenode", cookiePrefix: "better-auth" })` when `Capacitor.isNativePlatform()`, so `setupAuthClient` takes the finished options instead of `getToken` and the UI package never imports Capacitor. Each app calls it next to its existing `setupWrapper(...)`. This follows the same pattern as `@repo/wrapper`'s `setupWrapper`. `better-auth` is added to the three apps and declared in `packages/ui` `peerDependencies`, the same way the UI package used the hoisted SuperTokens.
- *Alternative:* a React context provider. Rejected: `better-auth/react` hooks live on the client instance (nanostores), and non-React code such as the wrapper's 401 handling needs the client too.

### 2. Transport: cookies on web, bearer on native
- **Web, admin and mobile-web:** cookies. The API and clients are same-site (`localhost:*` in dev, `*.gamenode.app` in prod), so the `SameSite=Lax` session cookie set on the API host goes with `credentials: "include"` requests. The wrapper already sets `WITH_CREDENTIALS = true`. Nothing is stored in JS, which is safer than SuperTokens' header mode.
- **Native:** the Capacitor WebView origin (`https://localhost`) is cross-site to the API, so cookies are unreliable. `better-auth-capacitor` keeps the session cookie in `@capacitor/preferences` and sends it as a bearer token on auth requests. For the generated API client, `setupWrapper` gets an optional `getToken` parameter that sets `ServerOpenAPI.TOKEN` (the generated `request.ts` already turns `TOKEN` into `Authorization: Bearer`). Mobile passes `() => getCapacitorAuthToken({ storagePrefix: "gamenode", cookiePrefix: "better-auth" })` on native and leaves it unset on web.
- `capacitorCookieHandler.ts` is deleted.

### 3. House `SessionAuth` keeps the SuperTokens contract
`SessionAuth({ requireAuth = true, children })` reads `authClient.useSession()`. While pending, it renders `null` when `requireAuth` is set, and its children otherwise. With no session and `requireAuth`, it calls `redirectToAuth()` and renders `null`. `useUserId()` returns `session?.user.id`. `useUserRoles()` returns `user.role?.split(",") ?? []`. `SessionAuthWithRoles({ roles })` wraps `SessionAuth` and renders `<AccessDenied />` when no role matches. Each app's own copies of these files (`apps/*/src/components/auth/**`) are deleted, and imports are repointed to `@repo/ui`.
`redirectToAuth({ redirectBack = true })` pushes `${authPath}?redirectTo=<current path>` through `useHooks().useRouter`. It is a hook (`useRedirectToAuth`) because the router comes from context. `authPath` is `/auth` on web and admin and `/m/auth` on mobile, passed through `UIProvider` hooks next to `useRouter`.
- *Alternative:* keep `SessionAuth` in each app. Rejected: packages/ui components need it, and there would be three copies of the same 20 lines.

### 4. Stale sessions after a lockout or sign-out elsewhere
`useSession` does not see API 401s by itself. Each app's `QueryClient` gets `queryCache: new QueryCache({ onError })` and the same `onError` on `mutationCache`. On `ApiError.status === 401` it calls `authClient.getSession({ query: { disableCookieCache: true } })`, which refreshes the session atom. `SessionAuth` then redirects. The `onError` handler is shared from `packages/ui` (`handleAuthError`) so each app adds one option, not a new layer.

### 5. Sign-in flow and return targets
The sign-in screen calls `authClient.signIn.social({ provider, callbackURL, errorCallbackURL, newUserCallbackURL })`. It uses absolute URLs on the current origin (`window.location.origin`) so the server validates them against `trustedOrigins`:
- `callbackURL` = origin + `redirectTo`, when `redirectTo` matches `^/(?!/)` (a relative path, not protocol-relative). Otherwise origin + home (`/home` on web, `/` on admin, `/home` on mobile, matching each app's current home).
- `errorCallbackURL` = origin + auth path (Better Auth appends `?error=`).
- `newUserCallbackURL` = origin + `/wizard/init` on web only.
The screen reads `?error=` and maps it as in decision 9. The old `/auth/callback/*` pages are deleted on web. On native, the screen passes relative paths instead, so the library rewrites them to `app.gamenode://…` (decision 7). The mobile `/m/auth/callback` page and route are deleted.

### 6. Server changes (sibling repo, minimal)
In `game-node-server/src/auth/auth.service.ts`:
```ts
trustedOrigins: [DOMAIN_WEBSITE, ...(configService.get("TRUSTED_ORIGINS") ?? "").split(",").map(s => s.trim()).filter(Boolean)],
plugins: [bearer(), capacitor(), admin({...})], // capacitor from "better-auth-capacitor"
```
`src/main.ts` CORS `allowedHeaders` adds `capacitor-origin` and `x-skip-oauth-proxy`; without them the WebView's preflight fails. The server adds `better-auth-capacitor@0.4.0` (exact pin) and `@better-auth/core@1.7.14`.
`.env.example` gets `TRUSTED_ORIGINS=http://localhost:3001,http://localhost:3002,https://localhost,capacitor://localhost,app.gamenode://`. `docker-compose.prod.yml` passes `TRUSTED_ORIGINS` through as optional. `auth.integration.spec.ts` adds two cases: a callback URL on a `TRUSTED_ORIGINS` origin is accepted while an unlisted one is rejected, a `sign-in/social` request with `capacitor-origin: app.gamenode://` and `callbackURL: "app.gamenode://home"` returns `redirect: false`, `/capacitor-authorization-proxy` redirects to the provider and sets the state cookie, and a stubbed provider callback to `app.gamenode://home` carries `?cookie=` with a session token that works as a bearer token. The server's main `openspec/specs/user-auth/spec.md` gets the matching requirement text in the same commit.
- `capacitor()` only trusts `capacitor://` and `ionic://` by default, so `app.gamenode://` must come from `TRUSTED_ORIGINS`.

### 7. Native sign-in with `better-auth-capacitor` (implemented, not device-tested)
```
App (WebView)                                   Native auth session (Custom Tab)          API
─────────────                                   ────────────────────────────────          ───
tap "Google" → signIn.social({provider, callbackURL: "/home", errorCallbackURL: "/m/auth"})
  library rewrites to app.gamenode://home …, adds capacitor-origin ─────────────────────▶ {url, redirect:false}
  AuthSession.openAuthSession(/capacitor-authorization-proxy?authorizationURL=…) ─▶ proxy sets state cookie ─▶ provider
                                                 provider ─▶ /v1/auth/callback/google ─▶ 302 app.gamenode://home?cookie=…
  session closes, library stores cookie in Preferences, notifies $sessionSignal
  useSession updates → SignInScreen's signed-in redirect pushes the safe redirectTo (or /home)
```
- We use the library instead of our own handoff because it removes the web handoff pages, the server `oneTimeToken` plugin, our token storage and the mobile token-exchange page. It keeps the flow inside a native auth session, and iOS needs no redesign later.
- **Navigation:** on native, `signIn.social` may never resolve. We don't await it. The sign-in screen already redirects when `useSession` reports a user, and the library notifies the session atom.
- **Errors:** the library drops the error code. The error redirect `app.gamenode://m/auth?error=<code>` also reaches `@capacitor/app`'s `appUrlOpen`, so `AppUrlListener` maps `app.gamenode://<path>?error=…` to `/<path>?error=…` and ignores `app.gamenode://` URLs that carry `cookie` (the library handles those). A closed session (user cancel) leaves the screen as it was. The pending state clears on the `appStateChange` resume event.
- **Android:** add an `app.gamenode` scheme intent filter to `AndroidManifest.xml`. The library's Kotlin plugin registers through `npx cap sync`.
- **Session token in the app redirect:** the cookie travels in the `app.gamenode://` redirect, which goes to the app through an intent rather than a page load. Another app that claims the scheme could intercept it. The one-time-token design had the same exposure (an intercepted token can be exchanged within its lifetime). We accept this, as Better Auth's Expo plugin does. A verified `https` App Link would close it, but the library only supports schemes.
- *Alternative:* the web handoff pages plus `oneTimeToken` (the earlier plan). Rejected: more code we own and an extra browser hop, with about the same security.

### 8. Linked sign-in methods
`PreferencesAccountScreen` gets a `SignInMethodsSection` above the restart action. It uses `authClient.listAccounts()` (React Query key `["auth","accounts"]`), `authClient.linkSocial({ provider, callbackURL: <origin>/preferences/account, errorCallbackURL: same })` and `authClient.unlinkAccount({ providerId })`, with a confirm modal. Unlink is disabled with a tooltip when there is only one account. The section reads `?error=` from its route for link failures. On native, `linkSocial` takes relative callback paths (`/preferences/account`), and the library runs it in the native auth session like sign-in.

### 9. Visual design

**Color tokens.** These are CSS Module variables, built from existing values. The global Mantine theme is not changed.

| Token | Value | Use |
|---|---|---|
| `--auth-bg` | `#0B0B0B` | page background (landing `.page`) |
| `--auth-surface` | `#090909` | sign-in card (landing `.card`) |
| `--auth-border` | `#292929` | card and divider borders |
| `--auth-text` | `#FAFAFA` | titles and button text |
| `--auth-muted` | `#A6A6A6` | supporting text, legal copy |
| `--auth-brand` | `var(--mantine-color-brand-6)` (`#F15025` family) | eyebrow, links, focus accents |
| `--auth-hero` | `linear-gradient(135deg, #f15025 0%, #d42912 56%, #5c0b06 100%)` | brand panel (landing footer gradient, rotated) |
| `--auth-glow` | `radial-gradient(60% 50% at 50% 0%, rgba(241,80,37,.18), transparent)` | subtle glow behind the card on mobile |
| error | Mantine `red` light `Alert` | failure messages |
| notice | Mantine `gray` light `Alert` | cancelled sign-in |
| locked | `#2B1712` surface (landing `linear-gradient(#2b1712, #1b1b1b)`) with a `brand-6` border | locked-out panel |

**Provider buttons.** Full width, 48px tall, 10px radius, 16px/500 Roboto, provider logo (20px SVG, stored locally under `packages/ui/src/assets/auth/`) left of a centered label. Colors follow each provider's brand rules, adjusted for a dark page:
- Google: `#FFFFFF` background, `#1F1F1F` text, official 4-color "G", hover `#F2F2F2`.
- Discord: `#5865F2` background, white text and logo, hover `#4752C4`.
- X: `#000000` background, white text and logo, `1px #3B3B3B` border (so it shows on `#090909`), hover `#16181C`.
- Pending: the selected button shows a Mantine `Loader` in place of the logo with `aria-busy`. The others are `disabled` at 50% opacity.
- Focus: `2px solid #FFFFFF` outline with 3px offset (landing focus rule), visible on every button color.

**Screens.**

1. *Sign-in (web and admin ≥ `md`):* a two-column 1fr/1fr layout at full viewport height. The left column is a brand panel on `--auth-hero` with `GameNodeLogo` (white), a headline ("Your games. Your library. Your community."), one muted line, and the landing mockup asset (`/img/landing` desktop mockup) bleeding off the bottom edge, decorative and `aria-hidden`. The right column centers a 400px card on `--auth-bg`. The card holds an eyebrow ("WELCOME" in `brand-6`, 13px/700), a title "Sign in to GameNode" (28px/600), a subtitle "New here? Your account is created the first time you sign in." (`--auth-muted`), the error/notice slot, three provider buttons with a 12px gap, and the legal line "By continuing you agree to our Privacy Policy" linking `/privacy`. Admin uses the same screen with the eyebrow "ADMIN" and no "new here" line.
2. *Sign-in (< `md`, mobile app and mobile web):* a single column. The logo is centered at the top over `--auth-glow`, then the card content without the card chrome, the buttons pinned to comfortable thumb height, and safe-area padding. Inside `AppPage withSearch={false}` on mobile.
3. *Error state:* an `Alert` above the buttons with a title and body from the error map. `account_not_linked` adds a secondary line naming the Preferences → Account path. Dismissing the alert clears `?error` from the URL.
4. *Locked-out state:* replaces the buttons with a `--locked` panel: lock icon in `brand-6`, title "This account can't sign in right now", body "It has been suspended or banned for breaking the community guidelines. If you think this is a mistake, contact support@gamenode.app.", a `mailto:` button, and a subtle "Use a different account" link that restores the buttons.
5. *Redirecting:* centered logo, `Loader`, and one line ("Taking you to Google…", "Signing you in…").
6. *Access denied:* a centered card titled "You don't have access to this page", the body "Your account doesn't have the role this page requires.", a primary "Go home" button and a subtle "Sign out" button.
7. *Sign-in methods (Preferences → Account):* a titled `Paper` with a short description and three rows (logo, provider name, linked email or "Not linked", trailing action: `Link` (outline brand) or `Unlink` (subtle red)). Unlink when it is the last method is disabled with a `Tooltip`. Unlink confirms through the existing `Modal` from `#@/util`.
8. *Sign-out:* the existing `/auth/logout` centered loader, then `/search` (web). Mobile sidebar and admin menus call the same `signOut` helper.

**Copy** goes in `@repo/locales` under `auth.*` (en and pt-BR), including every error message. Types are regenerated with `yarn locales:generate-types`.

**Error map** (`auth.errors.<code>`): `account_not_linked`, `email_not_found`, `banned`, `access_denied` (notice), `state_mismatch` and `please_restart_the_process` (shared "sign-in expired, try again"), `unable_to_link_account`, `default`.

## Risks / Trade-offs

- [Cookie mode depends on the API and client being same-site] → True for `localhost:*` and `*.gamenode.app`. A future client on another site needs bearer mode, which already exists for native.
- [Untested native sign-in could ship broken] → Kept behind the existing native code path (`Capacitor.isNativePlatform()`). Mobile web (`:3002`) uses the tested cookie flow. A follow-up native test pass is planned.
- [Custom scheme can be claimed by another app, which could receive the session cookie] → Same exposure as the Expo plugin and the earlier one-time-token design (decision 7). Accepted. Upgrade path: a verified App Link once the library supports it.
- [`better-auth-capacitor` is a young (0.x) single-maintainer package built against `better-auth` 1.6] → Exact pin, and the server integration spec (task 1.2) exercises its hooks on 1.7.14. If it is abandoned or breaks on an upgrade, copy its ~1,150 MIT lines into the repo.
- [X often returns no email, so its users get `email_not_found`] → The error copy suggests another provider. This was already true under SuperTokens.
- [`TRUSTED_ORIGINS` missing in prod breaks admin and native sign-in] → Listed in the migration plan. The server logs Better Auth's "invalid callbackURL" rejection.
- [Old SuperTokens tokens in `localStorage` and the Capacitor `frontendCookies` key] → Harmless leftovers. Mobile deletes the `frontendCookies` Preferences key once at startup (one line).
- [Some guarded content briefly hidden while the session loads] → Same as SuperTokens' `SessionAuth`. Better Auth caches the session atom after the first load.

## Migration Plan

1. Merge and deploy the server part first (`TRUSTED_ORIGINS`, `capacitor()`, CORS headers). Set `TRUSTED_ORIGINS` in Coolify to the admin domain plus `https://localhost,capacitor://localhost,app.gamenode://`.
2. Deploy web and admin. Ship a mobile build later, after native testing.
3. Rollback: redeploy the previous client builds. This only works together with a server rollback, because SuperTokens clients cannot talk to Better Auth.

## Open Questions

- Production admin domain for `TRUSTED_ORIGINS`. It is env-only and does not change the code.
