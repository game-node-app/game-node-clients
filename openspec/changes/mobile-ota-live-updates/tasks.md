# Tasks

## 1. Native fingerprint

- [ ] 1.1 Add `scripts/native-fingerprint.cjs`. It prints a short SHA-256 of the tracked `apps/mobile/android/**` files (excluding `version.properties`), `capacitor.config.ts` and the sorted `name@version` of installed deps that declare a `capacitor` field. Verify: running it twice prints the same value.
- [ ] 1.2 Add `scripts/native-fingerprint.test.cjs`. It checks that the value stays the same after a web-only edit or a `VERSION_CODE` bump, and changes after an edit to an android file or a plugin version change. Verify: `yarn test:releases` passes.

## 2. App integration

- [ ] 2.1 Add `@capawesome/capacitor-live-update` v7 to `apps/mobile` and add `LiveUpdate` config (`readyTimeout`, `autoDeleteBundles`, and reset-on-update if it is not the default) to `capacitor.config.ts`. Verify: `yarn build -F mobile` syncs the plugin into the android project.
- [ ] 2.2 Embed the fingerprint as a vite `define` and read `VITE_PUBLIC_LIVE_UPDATE_URL` (add it to `.env.production`). Verify: the built `dist` contains the fingerprint value.
- [ ] 2.3 Add `LiveUpdateListener`, mounted beside `AppUpdateListener` in `App.tsx`, on native platforms only. It calls `ready()`, checks on mount and on resume, and runs `downloadBundle` with the checksum, then `setNextBundle`. Errors are caught and logged. Verify: a debug build pointed at a test manifest applies the bundle on the next launch, and starts normally with the network off.
- [ ] 2.4 Check rollback manually: publish a test bundle that throws before `ready()` and confirm the following launch reverts to the previous bundle.

## 3. Release publishing

All publishing runs in GitHub Actions as part of the existing release flow: `ci.yml` calls `release-mobile.yml` only when the release plan selects `mobile` from a changeset. Nothing is published or configured from a developer machine.

- [ ] 3.1 Add the R2 values to the mobile list in `release-plan.cjs` `validateDelivery`, and map them into the env of the `--check-env` step in `ci.yml` (`prepare` job), so a mobile release fails before building if they're missing. Update `releases.test.cjs`. Verify: `yarn test:releases` passes.
- [ ] 3.2 Add steps to `release-mobile.yml` after `yarn build -F mobile`, reading the repository secrets and vars: zip `dist`, compute the sha256, upload the zip with the immutable cache header, then upload `latest.json` with `no-cache`. Use the AWS CLI already on the runner with the R2 endpoint. Verify: `actionlint` passes on the workflow.
- [ ] 3.3 Document the R2 bucket, the GitHub secrets and vars and rollback (overwrite or delete `latest.json`) in the release docs. Verify: the docs name every secret that `validateDelivery` checks.

## 4. Integration

- [ ] 4.1 After merging, check the first mobile release's Actions run: the zip and `latest.json` exist under `ota/<fingerprint>/` and the public URLs serve them. This first release is safe to publish live, because adding the plugin changes the fingerprint, so no installed app reads that path yet.
- [ ] 4.2 With that store build installed, merge a JS-only mobile changeset and confirm the device picks it up on the next launch. A release that changes a plugin version must not reach the device.

## Workflow follow-up

- First production rollout: the plugin release must go through the Play Store before OTA reaches users.
- Archive the change after review.
