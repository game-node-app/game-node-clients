# Tasks

## 1. Native fingerprint

- [x] 1.1 Add `scripts/native-fingerprint.cjs`. It prints a short SHA-256 of the tracked `apps/mobile/android/**` files (excluding `version.properties`), `capacitor.config.ts` and the sorted `name@version` of installed deps that declare a `capacitor` field, plus `@capacitor/core` and `@capacitor/android` versions. Verify: running it twice prints the same value.
- [x] 1.2 Add `scripts/native-fingerprint.test.cjs`. It checks that the value stays the same after a web-only edit or a `VERSION_CODE` bump, and changes after an edit to an android file, a plugin version change or a Capacitor runtime version change. Verify: `yarn test:releases` passes.

## 2. App integration

- [x] 2.1 Add `@capawesome/capacitor-live-update` v7 to `apps/mobile` and add `LiveUpdate` config (`readyTimeout`, `autoDeleteBundles`, and reset-on-update if it is not the default) to `capacitor.config.ts`. Verify: `yarn build -F mobile` syncs the plugin into the android project.
- [x] 2.2 Embed the fingerprint as a vite `define` and read `VITE_PUBLIC_LIVE_UPDATE_URL` (add it to `.env.production`). Verify: the built `dist` contains the fingerprint value.
- [x] 2.3 Add `LiveUpdateListener`, mounted beside `AppUpdateListener` in `App.tsx`, on native platforms only. It calls `ready()`, checks on mount and on resume, and runs `downloadBundle` with the checksum, then `setNextBundle`. Errors are caught and logged. Verify: a debug build pointed at a test manifest applies the bundle on the next launch, and starts normally with the network off.
- [x] 2.4 Check rollback manually: publish a test bundle that throws before `ready()` and confirm the following launch reverts to the bundle shipped with the installed app.

## 3. Release publishing

All publishing runs in GitHub Actions as part of the existing release flow: `ci.yml` calls `release-mobile.yml` only when the release plan selects `mobile` from a changeset. Nothing is published or configured from a developer machine.

- [x] 3.1 Add the R2 values to the mobile list in `release-plan.cjs` `validateDelivery`, and map them into the env of the `--check-env` step in `ci.yml` (`prepare` job), so a mobile release fails before building if they're missing. Update `releases.test.cjs`. Verify: `yarn test:releases` passes.
- [x] 3.2 Add steps to `release-mobile.yml` after `yarn build -F mobile`, reading the repository secrets and vars: zip `dist`, compute the sha256, upload the zip with the immutable cache header, then upload `latest.json` with `no-cache`. Use the AWS CLI already on the runner with the R2 endpoint. Verify: `actionlint` passes on the workflow.
- [x] 3.3 Document the R2 bucket, the GitHub secrets and vars and rollback (overwrite or delete `latest.json`) in the release docs. Verify: the docs name every secret that `validateDelivery` checks.

## 4. Integration

- [ ] 4.1 After merging, check the first mobile release's Actions run: the zip and `latest.json` exist under `ota/<fingerprint>/` and the public URLs serve them. This first release is safe to publish live, because adding the plugin changes the fingerprint, so no installed app reads that path yet.
- [ ] 4.2 With that store build installed, merge a JS-only mobile changeset and confirm the device picks it up on the next launch. A release that changes a plugin version must not reach the device.

## Workflow follow-up

- First production rollout: the plugin release must go through the Play Store before OTA reaches users.
- Archive the change after review.

## Verification status

- Fingerprint stability and native-input regression checks pass.
- Mobile production build and native sync pass; the emitted fingerprint matches the post-sync publishing fingerprint. The public hosting URL reaches Vite through Turbo.
- Mobile tests: 233 passing. Release tests: 21 passing with the runner's archive tools available, including a mocked AWS upload failure that leaves the manifest unchanged.
- Type-checking, lint (zero errors, existing warnings) and OpenSpec strict validation pass. `actionlint` passes for `release-mobile.yml`; the existing `ci.yml` `concurrency.queue` field is unsupported by actionlint v1.7.12. The rest of `ci.yml` passes when that existing field is omitted for validation.
- Tasks 2.3 and 2.4 verified on a Samsung SM-A346M running Android 16 using an isolated `app.gamenode.otatest` debug build and temporary local HTTPS fixtures. A valid zip staged on resume without changing the running bundle, activated on cold launch, and rendered with the WebView offline (`navigator.onLine === false`). A wrong checksum was rejected without staging. A bundle that threw before `ready()` rolled back after 10 seconds, and the following cold launch ran the shipped bundle. No phone radio settings were changed.
- Device testing caught an Android v7.5.2 documentation mismatch: native code verifies hex SHA-256, despite the TypeScript API docs saying base64. The listener now passes the manifest's hex checksum unchanged; its 15 regression tests and type-checking pass.
- Tasks 4.1 and 4.2 still require the first merged Actions release and installed store build. The temporary test app, HTTPS server and ADB port mappings were removed. The phone runs the normal current-workspace debug build without the test host or certificate; the existing app data was retained.
- All five R2 repository secret names were verified through GitHub. Workflows and docs now consistently use secrets, matching the configured repository. Secret values and production uploads remain unverified; no production publishing was performed from this machine. Repository setup is documented in `docs/releases.md`.
