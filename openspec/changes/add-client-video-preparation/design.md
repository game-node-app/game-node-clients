# Design

## Context

- The server (`PUT /v1/profile/video`) accepts MP4, MOV, WebM and Matroska up to 64 MiB, with optional normalized crop fields, answers 202 and converts with ffmpeg in a BullMQ queue (concurrency 1, up to 180 s, `nice 19`). It reconverts anything it receives, so a client-prepared file is never trusted as output.
- The uploaders (`ProfileEditAvatarUploader`, `ProfileEditBannerUploader`) are mirror 3-step steppers: select, probe and crop, confirm. The upload starts in `performVideoUpload`, and `useProfileVideoUpload` owns the mutation.
- `add-supporter-profile-video/design.md` lists client-side transcoding as a non-goal and rejected converting in the client "because encoder and browser differences are what we want to avoid". That reasoning concerns the final output, which stays on the server here.
- No WebCodecs, ffmpeg.wasm or MediaRecorder code exists in the repo. `react-easy-crop` is the only media dependency.

## Goals / Non-Goals

**Goals:**

- Cut upload size and server conversion work for the common case of a large phone video.
- Never make the upload fail or get stuck because of preparation.
- Keep the existing flow intact as the fallback.

**Non-Goals:**

- Replacing server conversion or relaxing its limits.
- Previewing the prepared file before confirming.
- Upload progress percentages.

## Decisions

**`mediabunny` over ffmpeg.wasm or MediaRecorder.** It uses WebCodecs directly, so conversion is hardware-assisted where available, and its `Conversion` API already covers `crop`, `width`/`height` with `fit: "cover"`, `frameRate`, `trim`, `codec`, `bitrate` and `audio: { discard: true }`. ffmpeg.wasm is several MiB and slow, and MediaRecorder gives no codec or bitrate control and records in real time. The module is imported dynamically on confirm, so it stays out of the main bundle.

**Prepare on confirm, not on selection.** The crop is only known after the user frames the video, so preparation runs when they confirm. The cost is that the confirm step previews the original file. Preparing earlier or twice to show the result was rejected as wasted work.

**One shared util and hook.** `prepareProfileVideo` is a pure async function in `profile/util`, with the geometry in small pure helpers (`computeCropRect`, `shouldUsePreparedVideo`) that are unit tested. `useProfileVideoPreparation` wraps it with progress, an `AbortController` and a result of `prepared`, `fallback` or `cancelled`, and never rejects. Both uploaders use it, so the two flows cannot drift.

**Crop semantics.** `react-easy-crop` reports percentages relative to the displayed video, and mediabunny applies `crop` after rotation and before resizing, so the percentages convert directly to pixels of the displayed size. `allowTransformationMetadata: false` bakes rotation into the frames so the result does not depend on the player. Values are rounded down to even numbers for yuv420p. Without a crop (unpreviewable video) the largest centered rectangle at the slot's aspect ratio is used, which mirrors the server's center crop.

**Send the prepared file with no crop.** It is already framed, so sending the original normalized crop would crop twice. The server's crop fields are optional.

**Fallback rule is "return null".** Unsupported device, no H.264 encoder at the slot size, a thrown error or a result that is not smaller all resolve to `null`, and the caller sends the original with its crop. Only a user abort is distinguished, so cancelling uploads nothing.

**Output parameters.** They match the server's budget: avatar 256x256 at 900 kbit/s and banner 1280x548 at 4 Mbit/s, 8 s, 30 fps, no audio, MP4 with `fastStart: "in-memory"`.

**Processing feedback.** `ProfileVideoUploadStatus` gains one line saying the current media stays until the new video is ready. The server already keeps the old video public while a new attempt runs, so the statement is accurate.

## Risks / Trade-offs

- [Encoder differences between browsers] → The server always reconverts, and any failure falls back to the original.
- [Rotation or crop mismatch on portrait phone videos] → Rotation is baked in before cropping and covered by the manual check on a real portrait video.
- [Android WebView may lack WebCodecs or H.264 encoding] → A feature check plus `canEncodeVideo` fall back to the current flow; verified manually on a device.
- [Long videos take time to prepare] → Only the first 8 s are processed, with progress and cancel.
- [A new dependency] → Loaded lazily and pinned to an exact version.
- [The server's 4 vCPU conversion queue is unchanged] → Smaller inputs shorten each job; raising concurrency is a separate decision.

## Migration Plan

No server change and no data migration. Ship web, admin and mobile together; rollback is reverting the clients, which restores the original-file upload.

## Open Questions

- Does the server require a minimum duration or reject a pre-encoded MP4 in any case? The specs do not say, so this is confirmed in the end-to-end check.
- Where is the real bottleneck on a real phone video: the upload, the crop preview or the queue? A measurement with a 4K portrait video before and after decides whether the queue also needs attention.
