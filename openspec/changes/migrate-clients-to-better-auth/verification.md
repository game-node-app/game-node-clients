# Verification

Run on 2026-10-31 against the local server (`game-node-server`, Better Auth, dev MySQL), with sessions created by the `docs/local-browser-testing.md` helper. No real provider account was used.

## Automated

- Server `yarn test src/auth`: 31 passed (5 new: trusted callback origins, `redirect:false` for `capacitor-origin`, authorization proxy and state cookie, `?cookie=` handoff usable as bearer token, CORS preflight with `capacitor-origin`).
- `yarn workspace mobile test`: 128 passed (new: `auth.test.tsx` for `getSafeRedirectPath`, `getAuthErrorKey`, `SessionAuth`; `getAppUrlTarget.test.ts`).
- `yarn workspace admin test`: 7 passed.
- Repo root: `yarn lint` (0 errors), `yarn type-check` and `yarn build` pass.
- `npx cap sync android` lists `better-auth-capacitor@0.4.0` (needs the `nohoist` entry in the root `package.json`; see the summary).

## Browser, mobile web `:3002` (`/m/auth`, 375px and 1280px)

- Three provider buttons, `aria-busy` on the clicked one and the others disabled, visible 2px white focus ring on keyboard focus.
- `?error=account_not_linked` (with the Preferences hint), `?error=banned` (locked-out panel with contact and "use a different account"), `?error=access_denied` (neutral notice), `?error=whatever` (generic message).
- Screenshots: `~/.t3/userdata/browser-artifacts/browser-screenshot-localhost-mvwnv6h4-c327db8b.png` (account_not_linked, 375px), `...-mvwnvk2i-b893250b.png` (banned, 375px), `...-mvwnvqbt-a92f1993.png` (access_denied, 1280px).

## Browser, signed-in flows with helper sessions

- Mobile web `/profile/preferences`: guarded page renders for a signed-in player; the Sign-in methods section lists providers. With Google and Discord seeded in `account`, unlinking Google (confirm modal) leaves Discord's unlink disabled as the last method.
- Web `:3000`: signed-out `/library` goes to `/auth?redirectTo=%2Flibrary`; a signed-in user opening `/auth?redirectTo=/preferences/account` lands on `/preferences/account` with the section shown.
- Admin `:3001`: editor opens `/dashboard/achievement/definitions`; a `user`-only account sees the access-denied screen; "Sign out" ends the session and the guard redirects to `/auth?redirectTo=...` showing the ADMIN variant.
- Clicking Google on admin reached `accounts.google.com` with `redirect_uri=http://localhost:5000/v1/auth/callback/google`, so the admin callback URL passes `TRUSTED_ORIGINS`.

## Not verified

- A completed provider sign-in (Google, Discord, X), `account_not_linked` from a real unverified Discord email, linking a second provider end to end, and a `lockOut` retry on a real sign-in: these need real provider accounts. The server integration suite covers the same paths with stubbed providers.
- The new-user `/wizard/init` redirect.
- Native Android sign-in, linking, restart persistence and sign-out (deferred by design).
