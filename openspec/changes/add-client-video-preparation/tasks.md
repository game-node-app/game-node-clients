# Tasks

## 1. Preparation util and hook

- [x] 1.1 Add `mediabunny` (exact version) to `packages/ui` and the `prepareProfileVideo` util with `computeCropRect`, `shouldUsePreparedVideo` and `isVideoPreparationSupported`, and verify with unit tests that percentages become even pixel values within the frame, that a missing crop centers at the slot aspect, and that a larger result is rejected.
- [x] 1.2 Add `useProfileVideoPreparation` with progress, cancel and a `prepared`, `fallback` or `cancelled` result, and verify with `yarn type-check`.

## 2. Uploader integration

- [x] 2.1 Prepare before upload in `ProfileEditAvatarUploader` and `ProfileEditBannerUploader`, sending the prepared file without crop and the original with its crop on fallback, and verify with a jsdom test (mocked preparer) covering prepared, fallback and cancelled.
- [x] 2.2 Add `ProfileVideoPreparationStatus` with progress and cancel, disabling confirm and back while preparing, and verify with a test that the status shows and confirm is disabled.
- [x] 2.3 Add the `profileVideo.prepare.*` keys to `en.json` and `pt-BR.json`, run `yarn locales:generate-types`, and verify with `yarn type-check`.

## 3. Processing feedback

- [x] 3.1 Add the "current media stays until the new video is ready" line to the processing state of `ProfileVideoUploadStatus` in both locales, and verify with an updated `profile-video-upload-status` test.

## 4. Release and verification

- [x] 4.1 Add the changeset for `web`, `admin` and `mobile`.
- [x] 4.2 Revert the unrelated `index.ts` files rewritten by `barrels:generate` (line-ending noise) so the diff only holds the three profile barrels, and verify with `git status`.
- [ ] 4.3 With a 4K portrait phone video on web (Chrome plus Safari or Firefox), measure upload size and time to `ready` before and after, confirm the framing matches the crop, and verify a browser without WebCodecs still uploads the original.
- [ ] 4.4 On an Android device or emulator, verify preparation works or falls back, and that an HEVC or MOV file still uploads.
- [ ] 4.5 Confirm against a real server that an H.264 MP4 without audio at the slot size is accepted and reaches `ready`.
- [x] 4.6 Run `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn workspace admin test`, and verify all pass.
