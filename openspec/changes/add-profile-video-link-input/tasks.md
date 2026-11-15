# Tasks

## 1. Contract

- [ ] 1.1 After `add-profile-video-from-link` ships, copy the server's `server_swagger.json` to `packages/wrapper/input/`, run `yarn wrapper:generate`, and verify the generated `ProfileService` has the link method and the status error codes include `download_failed`, `download_unsupported` and `download_too_large`.

## 2. Link handling

- [ ] 2.1 Add `parseProfileVideoLink` in `packages/ui/src/components/profile/util` and update the barrels, and verify with unit tests for pasted text with a title, trailing punctuation, each allowed host and subdomain, look-alike hosts, `http`, text without a link and an empty string.
- [ ] 2.2 Add `useProfileVideoLinkUpload` with the status-to-message mapping (202, 400, 403, 404, 409, 429 and other errors) and the owner profile invalidation, and verify with a test that spies on the service and covers each status, with 404 flagged as "unavailable".
- [ ] 2.3 Add the new `profileVideo.link.*` keys and the three link error codes to `ProfileVideoUploadStatus`'s table, in `en.json` and `pt-BR.json`, run `yarn locales:generate-types`, and verify with `yarn type-check` and an updated status test.

## 3. Uploaders

- [ ] 3.1 Add the shared `ProfileVideoLinkInput` component (field, submit button, disabled when empty, validation message, centered-video note, hidden after a 404), and verify with a component test for each of those states.
- [ ] 3.2 Render it on step 0 of `ProfileEditAvatarUploader` and `ProfileEditBannerUploader` for supporters only, and verify with the uploader tests that a supporter sees it, a non-supporter does not, and that submitting a link sends `{ url, type }` without crop fields and closes the uploader on success.

## 4. Release and verification

- [ ] 4.1 Add the changeset for `web`, `admin` and `mobile`.
- [ ] 4.2 Run `yarn lint`, `yarn type-check`, `yarn workspace mobile test` and `yarn workspace admin test`, and verify all pass.
- [ ] 4.3 With the server flag on, paste a public YouTube link as a supporter on web, and verify the slot goes `processing` then `ready` and the video plays; then paste a private link and verify the localized failure message.
- [ ] 4.4 On Android, paste a shared text with a title and a link, and verify the link is extracted and the flow completes.
