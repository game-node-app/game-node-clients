# Proposal

## Why

Every mobile fix, even a JS-only one, waits on a Play Store build and review, and users stay on old versions until they update. Most mobile changes only touch the web bundle, so they could reach installed apps in minutes.

## What Changes

- The Android app checks for a newer web bundle when it starts and when it resumes. It downloads the bundle in the background and applies it on the next launch.
- A bundle is offered only to installs whose native shell it is compatible with. Compatibility comes from a fingerprint of the native inputs, so nobody has to bump it by hand.
- A bundle that fails to start is rolled back to the bundle shipped with the installed app.
- Each explicit `mobile` release also publishes its web bundle and a manifest to a public Cloudflare R2 bucket. The signed APK/AAB pipeline stays as it is.
- Hosting decision: R2, not Coolify. The files are static, R2 has no egress fees and is served from Cloudflare's edge, and there is no server to run. Updates stay available when the VPS is down or being redeployed.

## Capabilities

### New Capabilities

- `mobile-live-updates`: delivering and applying web-bundle updates to installed mobile apps, including the compatibility gate, deferred apply and rollback.

### Modified Capabilities

None. `app-releases` is still an in-flight change (`automate-explicit-app-releases`) and has no main spec yet. This change only adds a publish step to the existing mobile delivery job, and that step depends on the existing release decision.

## Impact

- `apps/mobile`: new dependency `@capawesome/capacitor-live-update` (v7, matching Capacitor 7). New update listener mounted beside `AppUpdateListener`. New `VITE_PUBLIC_LIVE_UPDATE_URL` env var. Native sync is required, so the first build that includes the plugin ships through the Play Store.
- `scripts/`: native fingerprint script with a test. R2 secrets added to the `--check-env` validation for mobile.
- `.github/workflows/release-mobile.yml`: zip, upload and publish-manifest steps. `.github/workflows/ci.yml`: R2 values passed to the `--check-env` step.
- Infra: R2 bucket with a custom public domain. An R2 API token stored as GitHub repository secrets, used only by the CI mobile delivery job.
- Out of scope: iOS (there is no iOS project), staged rollouts/channels, update telemetry, bundle signing beyond HTTPS plus a checksum.
