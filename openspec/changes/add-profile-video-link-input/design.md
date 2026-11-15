# Design

## Context

- The uploaders (`ProfileEditAvatarUploader`, `ProfileEditBannerUploader`) are mirror 3-step steppers: select a file, probe and crop, confirm. Uploads go through `useProfileVideoUpload`, which maps statuses to message keys (202 accepted, 409 already processing, 400, 403, 413, 429) and invalidates the owner profile query so `useProfileVideoUploads` polls while a slot is `processing`.
- `add-client-video-preparation` adds on-device cropping and shrinking before an upload. A link has no local file, so neither the crop step nor the preparation applies.
- The server contract is in `game-node-server/openspec/changes/add-profile-video-from-link`: `POST /v1/profile/video/link`, a host allowlist, a kill switch that makes the route 404, and new error codes.
- Echo extracts the first `http(s)` URL from pasted text (`VideoDownloader.extractUrl`) because shared text carries a title before the link.

## Goals / Non-Goals

**Goals:**

- Paste a link and have it become the slot's video through the existing status flow.
- Fail fast and clearly on links the server would reject.
- Keep avatar and banner behavior identical, in one shared piece of code.

**Non-Goals:**

- Previewing or cropping a linked video.
- Any download or fetching in the browser.

## Decisions

**The link input sits on step 0, beside the dropzone.** A link is another way to finish step 0, so it lives there rather than in a separate flow. Submitting skips straight to the request: there is nothing to crop or preview, so the stepper is not advanced. A short note under the field says the server centers the video.

**A shared `ProfileVideoLinkInput` component and one mutation hook.** `ProfileVideoLinkInput` takes the `type` and calls `useProfileVideoLinkUpload`, a sibling of `useProfileVideoUpload` with the same error mapping extended for the link outcomes and the same cache invalidation. Both uploaders render the component, so the two slots cannot drift.

**Parse and validate in a pure helper.** `parseProfileVideoLink(text)` extracts the first `https` URL (trimming trailing punctuation), parses it with `URL`, and checks the host against the same allowlist as the server on label boundaries. It returns `{ url }` or `{ error }`. It is exported from `profile/util` and unit tested, and it only provides fast feedback: the server stays the authority.

**Reuse the upload status.** After a 202 the client invalidates `["userProfile", userId, "own"]`, exactly as for uploads, so the existing polling and `ProfileVideoUploadStatus` show `processing`, `ready` and `failed`. The three new error codes go into the single error-code table in `ProfileVideoUploadStatus`.

**404 means switched off.** The server hides the route when the flag is off. A 404 on submit sets a session-level flag that stops rendering the field; a page reload tries again. A `HEAD` probe on mount was rejected as an extra request for a rare state.

**No client-side preparation or crop for links.** The submission sends `{ url, type }` only, with no crop fields.

## Risks / Trade-offs

- [The route does not exist until the server ships] → The change is blocked on regenerating the wrapper from the server's swagger.
- [The allowlist is duplicated between server and client] → The client copy only gives fast feedback; the server rejects anything outside its own list, and a mismatch just shows the server's 400 message.
- [Links often fail after submission (private, login required)] → The failure arrives through the slot status, with a localized message and the current media untouched.
- [Users cannot preview what they will get] → The confirmation note says the video is centered; adding a preview is a later option.

## Migration Plan

1. Wait for `add-profile-video-from-link` to be deployed with the flag on.
2. Regenerate `@repo/wrapper`, then ship web, admin and mobile together.
3. Rollback is reverting the clients; the server keeps working with the field hidden.

## Open Questions

- Should the field be shown only when the server reports the feature as enabled, instead of discovering it from a 404? That needs a server-side capability flag.
