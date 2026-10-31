# Proposal

## Why

`game-node-server` replaced SuperTokens with Better Auth (archived change `2026-10-31-migrate-auth-to-better-auth`). The `/v1/auth/*` API, session format and user ids changed, so every client still on `supertokens-auth-react` can no longer sign in. The SuperTokens prebuilt UI also goes away, so the clients need their own sign-in screens. We are building those in the GameNode brand instead of the restyled SuperTokens widget.

## What Changes

- **BREAKING:** remove `supertokens-auth-react`, `supertokens-web-js`, `supertokens-website` and `supertokens-node` from `apps/web`, `apps/admin` and `apps/mobile`. Add the `better-auth` client (same version the server pins, `1.7.14`) with `adminClient()`. Add `better-auth-capacitor` (with its `@better-auth/core` peer) to `apps/mobile` for native sign-in.
- Add one shared auth client and session layer in `packages/ui`: `authClient`, a `SessionAuth` component that keeps the `requireAuth` contract, `useUserId`, `useUserRoles` (read from `user.role`), `SessionAuthWithRoles`, a `redirectToAuth` helper and an access-denied screen. The ~25 files that import `SessionAuth`/`useSessionContext` from SuperTokens switch to these house versions with only an import change.
- New branded sign-in screen with Google, Discord and X (the `twitter` provider), used by web (`/auth`), mobile (`/m/auth`, including the web build on `:3002`) and admin (`/auth`). It covers pending, cancelled, error and locked-out (suspended or banned) states, and returns users to the page they came from. New web users still land on `/wizard/init`.
- Sign-out on web, mobile and admin uses Better Auth `signOut` and clears the React Query cache.
- New "Sign-in methods" section in Preferences → Account. It lists linked providers, links another provider with `linkSocial`, and unlinks one (refused for the last one). This also gives users a way out of `account_not_linked`.
- Native (Capacitor) sign-in uses `better-auth-capacitor`. The provider flow runs in a native auth session (Chrome Custom Tabs on Android), the session comes back to the app through the `app.gamenode://` scheme, and it is stored in Capacitor Preferences and sent as a bearer token. Native verification is deferred: this change ships the code and does not test it on a device.
- The API wrapper sends credentials with cookies on web (same-site with the API) and as a `Bearer` token on native. Refresh `server_swagger.json` and regenerate `@repo/wrapper` so the removed `/v1/auth/logout` and `/v1/auth/providers` endpoints disappear.
- **Server (sibling repo `../game-node-server`, small):** add a `TRUSTED_ORIGINS` env list to Better Auth `trustedOrigins` so admin (`:3001`), mobile web (`:3002`) and the Capacitor WebView origins can use callback URLs. Add the `capacitor()` server plugin from `better-auth-capacitor`, trust `app.gamenode://`, and allow its `capacitor-origin` and `x-skip-oauth-proxy` request headers in CORS.
- Rewrite `docs/local-browser-testing.md` to create a local Better Auth session instead of a SuperTokens one.
- Out of scope: email/password, the admin user-management UI on top of `/v1/auth/admin/*` (list, roles, ban), the OAuth/MCP authorization server, and native device testing.

## Capabilities

### New Capabilities
- `client-auth`: how GameNode clients sign users in through social providers, show sign-in errors and lockouts, guard pages by session and role, sign out, manage linked sign-in methods, and hand native sign-ins back to the app.

### Modified Capabilities
None. `blog-editorial-access` only requires an "authenticated editor" and "signed-out user or user without editorial privileges", and that still holds through the new session layer.

## Impact

- **Apps:** `apps/web` (`_app.tsx`, `pages/auth/**`, `components/auth/**`, pages using `SessionAuth`/`useSessionContext`/`redirectToAuth`, `.env.local.example`), `apps/admin` (`_app.tsx`, `pages/auth/[[...path]].tsx`, `components/auth/**`, `.env.local.example`), `apps/mobile` (`App.tsx`, `Tabs.tsx`, `pages/auth.tsx`, `pages/auth_callback.tsx`, `components/auth/**`, `util/capacitorCookieHandler.ts` (deleted), `MobileSidebarMenu.tsx`, guarded pages, `AppUrlListener.tsx`, `AndroidManifest.xml`, `content-reactions.test.tsx`).
- **Shared:** `packages/ui/src/components/auth/**`, `ItemLikesButton.tsx`, `PreferencesRestartAccountModal.tsx`, preferences account category, every UI component that wraps content in `SessionAuth`. `packages/locales` (en, pt-BR) for the new auth strings. `packages/wrapper` (swagger refresh and regenerate, plus a token resolver in `setUp.ts`).
- **Dependencies:** add `better-auth@1.7.14` to the three apps and `better-auth-capacitor@0.4.0` (exact pin) plus `@better-auth/core@1.7.14` to mobile and the server. Remove all four `supertokens-*` packages from the three apps.
- **Server:** `src/auth/auth.service.ts`, `src/main.ts` (CORS headers), `package.json`, `.env.example`, `docker-compose.prod.yml` and `src/auth/auth.integration.spec.ts` in `game-node-server`.
- **Ops:** production must set `TRUSTED_ORIGINS` (admin domain, Capacitor WebView origins and `app.gamenode://`). Existing SuperTokens client sessions stop working, which is acceptable because there are no real users yet.
