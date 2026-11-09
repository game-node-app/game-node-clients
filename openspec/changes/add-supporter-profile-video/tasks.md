# Tasks

## 1. API contract

- [x] 1.1 Copy the server's `server_swagger.json` to `packages/wrapper/input/`, run `yarn wrapper:generate`, and verify the generated `ProfileService` has the video upload method and `ProfileResponseDto` has `avatarVideo`, `bannerVideo` and `videoUploads`.
- [x] 1.2 Update `useUserProfile` and any other consumers to the generated response type, and verify with `yarn type-check`.

## 2. Playback

- [x] 2.1 Add the viewport, reduced-motion and failure playback hook plus the `ProfileVideo` element in `packages/ui`, run `yarn workspace @repo/ui barrels:generate`, and verify with a jsdom test in `apps/mobile` covering off-screen, in-view, reduced-motion and rejected `play()` cases.
- [x] 2.2 Render video in `UserAvatar` as `Avatar` children, and verify with a test plus a browser check that a bordered, sized avatar keeps its shape and shows the static image when no video exists, and that a search of `packages/ui` and `apps/*` finds no user avatar rendered outside `UserAvatar` except the uploader's local preview once 2.4 is done.
- [x] 2.3 Render video in `ProfileBanner`, `SettingsProfileImages` and `SupporterProfilePreview`, and verify with a test that `customSource` suppresses the video and a null video keeps the image.
- [x] 2.4 Replace the actor avatar in `AggregatedNotification` with `UserAvatar`, and verify the existing notification tests pass after updating them, with the avatar using the actor's `userId`.

## 3. Upload status

- [x] 3.1 Add `useProfileVideoUploads` with the owner query, conditional polling and ready-transition invalidation, and verify with a vitest test using `vi.spyOn(ProfileService, ...)` that polling runs only while a slot is processing and that ready invalidates the profile.
- [x] 3.2 Add `ProfileVideoUploadStatus` with the error-code mapping, render it in `SettingsProfileImages` and `ProfileEditForm`, and verify with a test covering processing, each `errorCode`, and a null slot.

## 4. Upload flow

- [x] 4.1 Add the crop normalization helper, and verify with unit tests that percentages convert to `0..1` and that far-edge crops stay within bounds.
- [x] 4.2 Add the upload mutation hook with status-to-message mapping, and verify with a test covering 202, 400, 403 (refreshes supporter status), 409 (starts tracking), 413, 429 and 500.
- [x] 4.3 Add localized text and configurable accept lists to `ImageDropzone`, and verify with a component test that it renders translation keys and honors the accept list passed to it.
- [x] 4.4 Add video selection, crop, the unpreviewable fallback and the non-supporter notice to `ProfileEditAvatarUploader`; remove the GIF branch and accept entry; add `onError`. Verify with a component test that a GIF is rejected, a supporter can select video, and a non-supporter cannot.
- [x] 4.5 Add the same video flow to `ProfileEditBannerUploader` at the 1280:548 aspect and remove GIF from its accept list, and verify with a component test that crop fields are sent and that non-GIF image formats remain accepted. Confirm `GamePostEditor` still accepts GIF.
- [x] 4.6 Add all new keys to `en.json` and `pt-BR.json`, run `yarn locales:generate-types`, and verify with `yarn type-check`.

## 5. Supporter surfaces and specs

- [x] 5.1 Remove the video cover row from `SupporterFeatureCatalog`, and verify by updating `supporter-feature-catalog.test.tsx` so the remaining rows stay "Coming soon" and the video cover is absent.
- [x] 5.2 Search `packages/locales` and `packages/ui` for the `videoCover` plan copy, present it as available wherever it is marked unshipped, and verify in English and Brazilian Portuguese on the supporter plan screen.
- [x] 5.3 Update "Benefit availability labeling" in the `supporter-subscriptions` deltas of `add-supporter-subscriptions` and `redesign-supporter-settings` as described in `design.md`, and verify with `openspec validate` on both changes.

## 6. Integration

- [x] 6.1 Run `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn workspace admin test`, and verify all pass.
- [ ] 6.2 Following `docs/local-browser-testing.md` against a local server, upload a portrait phone video as a supporter on web, and verify the processing, ready and published states, the crop match, a failed conversion message, and a static image replacing the video.
- [ ] 6.3 On an Android device or emulator, verify muted autoplay in the WebView, the file picker accepting video, an avatar list staying responsive while scrolling, and the poster fallback with reduced motion enabled.
- [x] 6.4 Verify in the browser network panel that the bucket serves the MP4 as `video/mp4` with Range support.
- [x] 6.5 Run `yarn changeset` naming `web` and `mobile`, plus `admin` if it renders `UserAvatar`, and verify the changeset file names only apps.
