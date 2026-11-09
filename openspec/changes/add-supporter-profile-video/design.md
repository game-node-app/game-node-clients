# Design

## Context

The HTTP contract is fixed by the server (see the hand-off captured in `proposal.md` and `specs/profile-video/spec.md`). Findings from the client code that shape this design:

- `useUserProfile` calls the public `GET /v1/profile/:id`, which never returns `videoUploads`. No client code calls `GET /v1/profile` today (`profileControllerFindOwnV1` has no callers).
- The generated wrapper now includes the video routes, copied from `../game-node-server/server_swagger.json`. Profile reads return `ProfileResponseDto`, so generated types move away from `Profile`.
- Every user avatar goes through `UserAvatar` except `AggregatedNotification` and the local preview in `ProfileEditAvatarUploader`. Making `UserAvatar` play video therefore covers every avatar surface once notifications move to it.
- `NotificationAvatarDto` has only `id` and `filename`, so `AggregatedNotification.tsx:268` cannot build a correct URL from the DTO. `NotificationActorDto.userId` is available.
- `SupporterFeatureCatalog` lists `videoCover` as coming soon, and both supporter deltas name "video cover" as unshipped. The hand-off only flagged the "SHALL NOT gate" clause.
- The banner dropzone uses the default `IMAGE_MIME_TYPE`, which includes GIF, with a 3 MiB limit. The canvas crop flattens it to JPEG, so a GIF banner silently loses animation today.
- `ProfileEditAvatarUploader`'s mutation has no `onError`, so server rejections are silent.
- Mobile edits profiles through `ProfileEditForm`, not `SettingsProfileImages`.
- `react-easy-crop` has a `video` prop and reports crop percentages as the first `onCropComplete` argument. Capacitor's `Bridge.java` already disables the WebView's user-gesture requirement for media.

## Goals / Non-Goals

**Goals:**

- One shared playback path for avatars and banners.
- Keep the existing image crop flow intact for images.
- No per-app branching; everything lives in `packages/ui`.

**Non-Goals:**

- Client-side transcoding or duration trimming; the server enforces output limits.
- Upload progress percentages; the generated client does not expose them, so upload shows a pending state.
- A size or context threshold for avatars. Viewport mounting is the resource control.

## Decisions

**A shared `ProfileVideo` element and a playback hook.** A hook owns viewport detection (`IntersectionObserver` with a generous root margin), `useReducedMotion` from `@mantine/hooks`, and the failure flag set by a rejected `play()` or an `error` event. The element is mounted client-side only after intersection, so SSR output stays the poster image. Duplicating this in each renderer was rejected because the fallback rules would drift.

**Avatar renders the video as Mantine `Avatar` children.** When a video is active, `UserAvatar` omits `src` and passes the video, so callers' `size`, `className` and border props keep working. Wrapping `Avatar` in a positioned box was rejected because callers' borders and translate classes would land on the wrong element. The poster attribute covers the time before the first frame.

**Banner overlays the video** with `absolute inset-0 object-cover` inside the existing `Paper`, keeping the CSS background as the poster. `ProfileBanner` skips the video when `customSource` is set. `SettingsProfileImages` and `SupporterProfilePreview` use the same element.

**Notifications use `UserAvatar` with the actor's `userId`.** It fixes the extensionless URL and adds playback. The cost is one deduplicated profile query per distinct lead actor, the same pattern as other `UserAvatar` lists. Extending the DTO was rejected because it needs a server change and still would not carry the video.

**A separate owner query for status.** `useProfileVideoUploads` calls `GET /v1/profile` with key `["userProfile", userId, "own"]`. Existing invalidations of `["userProfile", userId]` match it by prefix, so uploads and static image saves refresh it with no extra wiring. It uses `staleTime: 0`, `refetchOnMount: "always"` and a function `refetchInterval` returning 3 seconds while any slot is `processing`, overriding the web defaults. On a `processing` to `ready` change it invalidates `["userProfile", userId]` so public-profile data picks up the video. The server's 30-minute timeout bounds polling.

**Status is a small component per slot,** `ProfileVideoUploadStatus`, rendered in both `SettingsProfileImages` and `ProfileEditForm`, so web and mobile both show it. Error codes map to locale keys in one table.

**Uploaders branch on the selected file's type.** Video files go to a video crop step using `Cropper`'s `video` prop, at `aspect` 1 for avatars and `1280 / 548` for banners, with minimum zoom 1 so the frame stays within the media. A pure, unit-tested helper converts crop percentages to `0..1` values, rounding so `x + width <= 1` and `y + height <= 1`. The upload logic lives in one mutation hook shared by both uploaders, which maps `ApiError.status` to locale keys, and on 409 still starts status tracking.

**Unpreviewable videos skip cropping.** HEVC, MOV and Matroska are valid on the server but may not play locally. A probe `<video>` that errors or fails to load metadata sends the user to the confirm step with a center-crop notice and no crop fields. Rejecting those files client-side was rejected because the server accepts them.

**Accept lists.** Avatar becomes PNG and JPEG, with the GIF branch removed. Banner becomes `IMAGE_MIME_TYPE` minus GIF, so other formats that the canvas re-encodes to JPEG keep working for free users. Video accepts map MIME types to extensions, since Matroska often has an empty browser MIME type. `ImageDropzone`'s hard-coded English moves to locale keys because the video flow needs different text, and it reports rejections with friendly messages rather than raw codes.

**Supporter gate.** `useSupporterStatus` decides whether video is offered. The server remains authoritative through 403, which invalidates that query. The non-supporter notice links to the supporter screen and is hidden while status is loading. The dropzone itself waits for the status before rendering: a native file dialog freezes its accepted formats at click time, so painting it image-only first would hide video files from a supporter. A failed status read falls back to the image-only list. `SettingsProfileImages` and `ProfileEditForm` request the status themselves so the uploader modal usually opens with it already cached.

**Reconciling supporter specs.** `supporter-subscriptions` is not a main spec, so a MODIFIED delta here could not apply. Instead, the wording in both in-progress changes is edited directly: "video cover" leaves the unshipped list, and the requirement notes that retiring GIF uploads for all users is a format change owned by `profile-video`, not a supporter gate. If both changes are archived first, this needs converting to a normal MODIFIED delta.

**Catalog.** The video cover row is removed from `FEATURE_GROUPS`, because every row and the section header there are "Coming soon". It is promoted by the uploader notice and plan copy instead.

## Risks / Trade-offs

- [Older app builds still send GIF and get 400] → Accepted by the server contract. The avatar uploader gains `onError` for current builds; ship web and mobile promptly after the server.
- [Free users lose animated GIF uploads while supporters gain video, which reads as moving a free feature behind a plan] → Decided on the server. Existing GIFs keep working and the spec wording is updated to state this openly.
- [Many videos in lists hit Chromium's media player limit] → Viewport mounting and unmounting, with the poster as fallback.
- [A static image silently removes a published video, even for a lapsed supporter whose video was hidden] → Server behavior, accepted: saving an image is an explicit choice to replace that slot, and this change adds no extra warning.
- [Crop preview differs from server output for rotated files] → The server crops after autorotation, matching browser display. Covered in manual testing with a portrait phone video.
- [Avatar children rendering differs from the expected layout in Mantine v9] → Verified on the first rendering task, before other surfaces build on it.
- [The bucket does not serve `video/mp4` or Range requests correctly] → Checked in end-to-end verification; the poster fallback prevents a broken UI.

## Migration Plan

1. Deploy the server before the clients ship.
2. Ship web and mobile together. No data migration is needed.
3. Rollback: reverting the clients restores image-only display, since the server keeps `avatar` and `banner` as posters. The GIF path stays unavailable because the server rejects it.
