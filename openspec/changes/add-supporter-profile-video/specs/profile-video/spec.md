# Spec Delta

## Purpose

Defines how clients display supporter profile videos, how supporters upload and track them, and which image formats clients accept for avatars and banners.

## ADDED Requirements

### Requirement: Published profile video playback
Wherever a user's avatar or banner is rendered from their profile, clients SHALL play that slot's published video muted, looping and inline, using the slot's image as the poster. The video URL SHALL be built from the stored filename and extension on the same base URL as profile images.

#### Scenario: Profile with a published avatar video
- **WHEN** a profile with a non-null `avatarVideo` is rendered in view
- **THEN** the avatar plays that video muted, looping and inline, with the avatar image as its poster

#### Scenario: Every user avatar surface
- **WHEN** a user with a published avatar video appears anywhere their avatar is shown, including lists, navigation menus, comments, notifications and small sizes
- **THEN** that avatar plays the video, with no exclusion by surface or size

#### Scenario: Local avatar preview
- **WHEN** the avatar uploader previews a locally selected replacement
- **THEN** the preview shows the replacement and does not play the published avatar video

#### Scenario: Profile with a published banner video
- **WHEN** a profile with a non-null `bannerVideo` is rendered in view
- **THEN** the banner plays that video muted, looping and inline, covering the banner area, with the banner image as its poster

#### Scenario: No published video
- **WHEN** the profile's video field for a slot is `null`
- **THEN** that slot renders its existing image, including a previously uploaded GIF avatar

#### Scenario: Banner image preview during editing
- **WHEN** the banner preview shows a locally selected replacement image
- **THEN** the preview shows the replacement and does not play the published banner video

#### Scenario: Notification actor avatar
- **WHEN** a notification shows its lead actor
- **THEN** the avatar renders from that actor's profile with a complete file URL, and plays their video if one is published

### Requirement: Profile video resource limits
Clients SHALL mount a profile video element only while it is in or near the viewport, and SHALL remove it once it moves away.

#### Scenario: Off-screen video
- **WHEN** a rendered avatar or banner is far outside the viewport
- **THEN** no video element is mounted for it and its poster image is shown instead

#### Scenario: Scrolled into view
- **WHEN** an avatar or banner with a published video approaches the viewport
- **THEN** its video element mounts and starts playing

### Requirement: Poster-only fallback
Clients SHALL show only the poster image when the user prefers reduced motion or when the video cannot autoplay or load.

#### Scenario: Reduced motion
- **WHEN** the user has `prefers-reduced-motion: reduce` enabled
- **THEN** no profile video plays and the poster image is shown

#### Scenario: Autoplay blocked or load failure
- **WHEN** the browser rejects playback or the video fails to load
- **THEN** the poster image is shown and no error is presented to the user

### Requirement: Supporter video selection
Clients SHALL let a supporter choose one video for the avatar or banner slot, accepting MP4, MOV, WebM and Matroska files up to 64 MiB. Clients SHALL NOT offer video selection to a user who is not a confirmed supporter.

#### Scenario: Supporter opens an uploader
- **WHEN** a confirmed supporter opens the avatar or banner uploader
- **THEN** they can select an image or a supported video file

#### Scenario: File above the video limit
- **WHEN** a supporter selects a video larger than 64 MiB
- **THEN** the file is rejected before upload with a localized size message

#### Scenario: Non-supporter opens an uploader
- **WHEN** a user who is not a supporter opens the avatar or banner uploader
- **THEN** they can select images only, and are told that video is a supporter benefit with a way to reach the supporter screen

#### Scenario: Supporter status still loading
- **WHEN** the uploader opens before supporter status is known
- **THEN** it waits for the status before rendering the file picker, so the picker never opens with an image-only filter that would hide video files from a supporter

### Requirement: Video crop submission
Clients SHALL let the supporter frame a previewable video at the slot's output aspect ratio and SHALL send the visible frame as normalized values, all four together. The values SHALL satisfy `cropX + cropWidth <= 1` and `cropY + cropHeight <= 1`, with width and height greater than 0.

#### Scenario: Previewable video
- **WHEN** a supporter confirms a framing for a video the device can play
- **THEN** the upload includes `cropX`, `cropY`, `cropWidth` and `cropHeight` within bounds, computed on the video as displayed after rotation

#### Scenario: Crop touching the far edge
- **WHEN** the frame touches the right or bottom edge of the video
- **THEN** the submitted origin plus size does not exceed 1 despite rounding

#### Scenario: Video the device cannot preview
- **WHEN** the selected video cannot be played on the device
- **THEN** the supporter is told the server will center the video and can upload it with no crop fields

### Requirement: Video upload outcome handling
Clients SHALL treat a 202 response as the start of processing, and SHALL show a localized message for each rejection status defined by the server contract.

#### Scenario: Upload accepted
- **WHEN** the server responds 202
- **THEN** the slot is shown as processing and the uploader finishes without waiting for conversion

#### Scenario: Slot already processing
- **WHEN** the server responds 409
- **THEN** the user is told a video is already processing for that slot and the slot is shown as processing

#### Scenario: Entitlement lost
- **WHEN** the server responds 403
- **THEN** the user is told video requires a supporter plan and the client refreshes supporter status

#### Scenario: Invalid file, oversize or throttled
- **WHEN** the server responds 400, 413 or 429
- **THEN** a localized message explains that the file is unsupported, too large, or that the user must wait before retrying

### Requirement: Video processing status
Clients SHALL poll the owner's profile while a slot's latest attempt is `processing`, and SHALL stop when no slot is processing. Clients SHALL show each slot's processing or failed state to its owner where they manage profile images, on web and mobile.

#### Scenario: Processing continues after leaving
- **WHEN** the owner returns to profile image management while an attempt is processing
- **THEN** the processing state is shown and polling resumes

#### Scenario: Conversion succeeds
- **WHEN** a slot changes from `processing` to `ready`
- **THEN** polling stops, unless the other slot is still processing, and the owner's displayed avatar or banner refreshes to the new video

#### Scenario: Conversion fails
- **WHEN** a slot reports `failed`
- **THEN** a localized message for its `errorCode` is shown, the current avatar or banner is unchanged, and the owner can upload again

#### Scenario: Independent slots
- **WHEN** one slot is processing
- **THEN** the other slot can still be uploaded

#### Scenario: Viewing another user's profile
- **WHEN** a user views someone else's profile
- **THEN** no upload status is shown and no polling occurs

### Requirement: Static profile image formats
Clients SHALL NOT upload GIF content as an avatar or banner for any user. Selecting an image SHALL always go through cropping, and the uploaded result SHALL be PNG or JPEG.

#### Scenario: GIF selected as avatar or banner
- **WHEN** a user attempts to select a GIF in the avatar or banner uploader
- **THEN** the file is rejected at selection and no upload is made

#### Scenario: Post uploads
- **WHEN** a user adds a GIF to a post
- **THEN** the post editor still accepts it

### Requirement: Static image replaces the slot's video
After a static avatar or banner image is saved, clients SHALL refresh the profile so the slot no longer plays the removed video and any cancelled attempt is no longer shown as processing.

#### Scenario: Image saved over a published video
- **WHEN** an owner with a published banner video saves a static banner image
- **THEN** the banner shows the new image and the video no longer plays

### Requirement: Video cover availability labeling
Clients SHALL NOT label the video cover "Coming soon" / "Em breve", and SHALL present it as an available supporter benefit. Other unshipped benefits SHALL keep their existing labels.

#### Scenario: Supporter feature list
- **WHEN** a user opens the supporter feature catalog
- **THEN** the video cover is not listed as coming soon, and the remaining upcoming benefits still are

#### Scenario: Localized copy
- **WHEN** the active language is English or Brazilian Portuguese
- **THEN** all profile video text appears in that language without exposing a translation key
