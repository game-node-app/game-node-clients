# Design

## Context

- The mobile app is Capacitor 7 / Ionic, Android only. It already uses Capawesome plugins and `AppUpdateListener` (`apps/mobile/src/components/general/AppUpdateListener.tsx`) to prompt for store updates.
- Mobile releases are explicit: CI runs `.github/workflows/release-mobile.yml`, which builds with `yarn build -F mobile` (`vite build && cap sync`). That produces `apps/mobile/dist` and the signed APK/AAB. `prepare-release.cjs` bumps `VERSION_CODE` on every mobile release, so `VERSION_CODE` cannot tell us whether the native side changed.
- `scripts/release-plan.cjs --check-env` validates delivery secrets for each app.

## Goals / Non-Goals

**Goals:** a self-hosted, free OTA path with no manual compatibility bookkeeping and no backend.

**Non-Goals:** channels or staged rollout, update analytics, forced or immediate apply, a web-only publish path separate from a mobile release.

## Decisions

### Host on Cloudflare R2, not Coolify

R2 serves the static zip and JSON from Cloudflare's edge with no egress fees, and CI uploads to it with the AWS CLI that is already on GitHub runners (`--endpoint-url`). The Coolify option would mean another container serving static files over VPS bandwidth, and updates would fail whenever the VPS is down or redeploying. R2's free tier (10 GB storage, 10M reads/month) covers this load.

Layout under the public custom domain:

```
ota/<fingerprint>/latest.json      Cache-Control: no-cache
ota/<fingerprint>/<bundleId>.zip   Cache-Control: public, max-age=31536000, immutable
```

`latest.json`: `{ "bundleId": "<mobile version>-<short sha>", "url": "...", "checksum": "<sha256 hex>" }`.

### Compatibility via native fingerprint, not `minNativeVersion`

`scripts/native-fingerprint.cjs` produces a short SHA-256 over:
- the contents of the git-tracked files under `apps/mobile/android/`, excluding `version.properties`
- `apps/mobile/capacitor.config.ts`
- the sorted `name@version` of every installed dependency of `apps/mobile` whose `package.json` declares a `capacitor` field, plus `@capacitor/core` and `@capacitor/android` (the runtime packages do not declare that field). That field is how Capacitor plugins identify themselves, so this covers `@capacitor/*`, `@capawesome/*` and anything added later.

The web build embeds the fingerprint as a `define` constant. A bundle can only be installed on a shell with the same fingerprint, so the fingerprint in the running JS always equals the shell's fingerprint, even after OTA updates. The app fetches `ota/<its fingerprint>/latest.json` and never has to compare versions.

Alternative considered: a hand-maintained `minNativeVersion`. It is less code, but forgetting to bump it ships JS that calls plugins the old shell doesn't have, and that crashes. This is the main way OTA setups fail, so it is worth the small script.

### Plugin: `@capawesome/capacitor-live-update` in manual mode

Same vendor as the existing plugins. Free and open source, and it works with any HTTPS URL. Flow, in a new `LiveUpdateListener` mounted next to `AppUpdateListener`:

1. On mount: call `LiveUpdate.ready()`. This confirms the current bundle and disarms rollback.
2. On mount and on `App` `resume`: fetch `latest.json`. If `bundleId` differs from `LiveUpdate.getCurrentBundle()`, pass the manifest’s hex SHA-256 directly to the Android plugin and run `downloadBundle({ url, bundleId, checksum })`, then `setNextBundle({ bundleId })`.
3. Wrap everything in try/catch and log failures. The app must never be blocked by them.

Config in `capacitor.config.ts`: `LiveUpdate: { readyTimeout: 10000, autoDeleteBundles: true }`. The ready timeout resets a failed OTA to the bundle shipped with the installed app, not the previous OTA bundle. Capacitor always resets on native updates; v7 has no `resetOnUpdate` option.

Alternative considered: Capgo. Its self-hosted auto mode needs its update API or its Supabase backend, which is more to run for no gain at this scale.

### Publish from CI, inside `release-mobile.yml`

Publishing is fully automated and tied to the changeset flow: `ci.yml` calls `release-mobile.yml` only when `needs.checks.outputs.mobile == 'true'`, i.e. a changeset selected mobile, checks passed, and the push is on main. The R2 credentials follow the keystore pattern: repository secrets, so the `prepare` job's `--check-env` step can see them and fail before any build. After `yarn build -F mobile`, zip `apps/mobile/dist`, compute its SHA-256, and upload the zip. Upload `latest.json` only after that. The delivery runs only when a changeset explicitly selects mobile, so the release-decision rules apply unchanged. Every mobile release publishes OTA; installs on a different fingerprint simply never see it.

## Risks / Trade-offs

- [The fingerprint misses a native input, e.g. a plugin without a `capacitor` field] → The rollback timeout limits the damage. The fingerprint test covers the plugin-detection rule.
- [The fingerprint changes when no real native change happened, e.g. a gradle formatting edit] → Only cost: those installs wait for the store update. This is safe.
- [The manifest's checksum comes from the same origin as the bundle, so it doesn't protect against a compromised bucket] → Write access to R2 is limited to a scoped CI token. Signing is out of scope (proposal).
- [The OTA reaches users before the store build of the same release is reviewed] → Acceptable. It is the same JS, and the store build carries it too.
- [The first plugin release is native] → It must go out through the Play Store before any OTA can reach users.

## Migration Plan

1. Create the R2 bucket and custom domain. Add `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_BUCKET` and `LIVE_UPDATE_PUBLIC_URL` as GitHub repository secrets. This is a one-time setup in the repo settings; nothing is stored locally.
2. Ship a mobile release that includes the plugin through the Play Store.
3. Later mobile releases are delivered OTA to matching installs.

Rollback: delete `ota/<fingerprint>/latest.json`, or point it at the previous bundle id. Installs that fail before calling `ready()` recover to the bundle shipped with the installed app after the ready timeout. Bundles that already signaled readiness recover through the next good manifest; deleting the manifest only stops further downloads.
