# Proposal

## Why

The server now converts short videos into supporter avatars and banners, and it rejects new GIF uploads for profile images. Current clients ignore the published videos and still offer a GIF avatar path that now fails with 400, so the clients must adopt the contract before the feature is usable and the GIF path must go.

## What Changes

- Regenerate `@repo/wrapper` from the server swagger so clients get `PUT /v1/profile/video`, `ProfileResponseDto`, `avatarVideo`, `bannerVideo` and `videoUploads`.
- Play published videos (muted, looping, inline, with the poster) everywhere a user avatar or profile banner appears, at any size, mounting them only near the viewport and falling back to the poster for reduced motion or blocked autoplay.
- Let supporters upload an avatar or banner video with a crop preview, normalized crop values, and visible processing, ready and failure states driven by polling the owner profile.
- Show non-supporters that video is a supporter benefit, without blocking their image uploads.
- **BREAKING**: Remove GIF from avatar and banner uploads for every user. Existing GIF avatars keep displaying, and post uploads keep GIF. Older app builds that still send a GIF receive 400.
- Fix notification actor avatars, which build a URL without a file extension, by rendering them through the shared user avatar.
- Stop labeling the video cover "Coming soon", and reconcile the supporter spec wording this change contradicts.
- Localize the new copy in English and Brazilian Portuguese.

Out of scope, as fixed by the server contract: a delete-video action, trimming, HLS, presigned uploads and converting existing GIFs.

## Capabilities

### New Capabilities

- `profile-video`: Displaying supporter profile videos, uploading and tracking them, and the image formats accepted for avatars and banners.

### Modified Capabilities

None. `openspec/specs/` only holds blog capabilities. The conflicting `supporter-subscriptions` requirement exists only as a delta in two unarchived changes, so a delta here has no main spec to apply to; `design.md` records how it is reconciled.

## Impact

- **API and generated code**: `packages/wrapper/input/server_swagger.json` and the code generated from it. The profile read endpoints return `ProfileResponseDto` instead of `Profile`.
- **Rendering**: `UserAvatar`, `ProfileBanner`, `SettingsProfileImages`, `SupporterProfilePreview`, `AggregatedNotification`.
- **Uploads**: `ProfileEditAvatarUploader`, `ProfileEditBannerUploader`, `ImageDropzone`, plus new hooks and a status component in `packages/ui`. `ProfileEditForm` gains the status so the mobile edit path shows it too.
- **Supporter surfaces**: `SupporterFeatureCatalog`, its test, and plan copy.
- **Other specs**: the `supporter-subscriptions` deltas in `add-supporter-subscriptions` and `redesign-supporter-settings`.
- **Locales**: `packages/locales` English and Brazilian Portuguese JSON.
- **Dependency on the server**: the server must be deployed before clients ship.
- **Dependencies**: none added; `react-easy-crop` already supports video.
