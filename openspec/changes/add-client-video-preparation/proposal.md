# Proposal

## Why

Supporters upload the raw video chosen on their device (up to 64 MiB, often 4K or HEVC from a phone) for the avatar and banner. The server then converts it asynchronously on a shared 4 vCPU VPS, one job at a time, while the client only polls. On the web this is slow end to end: a heavy upload, a crop preview decoded from the original file, a wait in the conversion queue and no sense of progress.

The server stays the final converter, because it guarantees an identical, bounded output for every client. What the client can do cheaply is crop, scale and re-encode before sending, so the upload shrinks from tens of MiB to a few MiB and the server has little left to do.

## What Changes

- Before uploading, the avatar and banner uploaders crop the video to the framed area, scale it to the slot size (256x256 avatar, 1280x548 banner), keep at most 8 s at 30 fps, drop audio and encode H.264 in MP4, using WebCodecs through `mediabunny`.
- The prepared file is uploaded without crop fields, since it is already framed. If the device cannot prepare it, preparation fails, or the result is not smaller than the original, the original file is uploaded with the normalized crop exactly as today.
- While preparing, the uploader shows progress and a cancel action, and blocks confirm and back.
- While the server is still processing, the status shows that the previous video or image stays visible until the new one is ready, instead of only a spinner.
- No server change and no change to the upload contract.

Out of scope: moving conversion out of the server, upload progress percentages (the generated client does not expose them), changing server limits or codecs, and a preview of the prepared file before confirming.

## Capabilities

### New Capabilities

- `profile-video-preparation`: Reducing a selected profile video on the device before upload, the fallback to the original file, and the preparation and processing feedback.

### Modified Capabilities

None. `profile-video` exists only as a delta in the unarchived `add-supporter-profile-video`, so it is not a main spec to modify. This change revises that change's non-goal "client-side transcoding or duration trimming": the client now reduces the file as an optimization, while the server still enforces output limits.

## Impact

- **Uploads**: `ProfileEditAvatarUploader`, `ProfileEditBannerUploader`, plus the new `prepareProfileVideo` util, `useProfileVideoPreparation` hook and `ProfileVideoPreparationStatus` component in `packages/ui`.
- **Status**: `ProfileVideoUploadStatus`.
- **Dependencies**: adds `mediabunny` to `packages/ui` (loaded with a dynamic `import()` only when a video is confirmed).
- **Locales**: new `profileVideo.prepare.*` keys in English and Brazilian Portuguese.
- **Tests**: new jsdom tests in `apps/mobile`, which mock the preparer because jsdom has no WebCodecs.
- **Platforms**: web and admin browsers with WebCodecs; the Capacitor WebView on Android where WebCodecs is available. Everything else keeps the current flow.
