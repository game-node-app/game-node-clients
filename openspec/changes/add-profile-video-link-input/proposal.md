# Proposal

## Why

Supporters can only set an avatar or banner video by picking a file on their device. The Echo app lets people paste a link instead, and most of the clips people want live on YouTube, TikTok, Instagram or X. The server change `add-profile-video-from-link` (in `game-node-server`) lets it download and convert such a link; the clients need the input that sends it.

## What Changes

- In the avatar and banner video uploaders, supporters get a "paste a link" field next to the file dropzone, with a button that submits it.
- The client extracts the first `https` link from the pasted text (shared text often carries a title before the link), checks it against the same host list the server enforces, and shows a friendly message for anything else before calling the server.
- Submitting calls the new `POST /v1/profile/video/link` through the generated wrapper, then reuses the existing status tracking: the slot shows `processing`, `ready` or `failed` exactly as for uploads, and 409 keeps meaning "already processing".
- A link has no local file to preview, so the crop and client-side preparation steps are skipped and the server centers the video. The confirm step explains this.
- New failure messages for the link error codes (`download_failed`, `download_unsupported`, `download_too_large`) and for 404 when the server has the feature switched off, in English and Brazilian Portuguese.
- The link field is hidden for non-supporters, who keep the supporter notice, and when the server answers 404 (feature off) it stops being offered for the session.

Out of scope: previewing or cropping a linked video before it is processed, direct file links, and choosing the start time of the clip.

## Capabilities

### New Capabilities

- `profile-video-link`: Submitting a link for an avatar or banner video, the client-side link checks, and how link failures are shown.

### Modified Capabilities

None. `profile-video` and `profile-video-preparation` exist only as deltas of unarchived changes, so nothing to modify.

## Impact

- **Wrapper**: regenerate `@repo/wrapper` from the server swagger once `add-profile-video-from-link` ships, to get the link route, request type and error codes.
- **Uploads**: `ProfileEditAvatarUploader` and `ProfileEditBannerUploader`, a new link input component and a `useProfileVideoLinkUpload` mutation hook next to `useProfileVideoUpload`, and a pure `parseProfileVideoLink` helper in `profile/util`.
- **Status**: `ProfileVideoUploadStatus` error mapping.
- **Locales**: new keys under `profileVideo.link.*` and `profileVideo.status.errors.*` in English and Brazilian Portuguese.
- **Dependency on the server**: the route and error codes must be deployed, with the feature flag on, before this ships.
- **Risk to flag**: the platforms' terms of service forbid downloading videos outside their apps; see the server proposal. The client does not mention or bypass this beyond offering the field to supporters.
