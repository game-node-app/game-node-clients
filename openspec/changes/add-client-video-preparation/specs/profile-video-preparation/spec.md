# Spec Delta

## Purpose

Defines how clients reduce a supporter's selected avatar or banner video on the device before uploading it, when they fall back to the original file, and what feedback they show during preparation and server processing.

## ADDED Requirements

### Requirement: Client-side video preparation
When a supporter confirms an avatar or banner video, the client SHALL try to crop it to the framed area, scale it to the slot size, limit it to 8 seconds and 30 frames per second, remove the audio and encode it as H.264 in MP4 before uploading. The slot size SHALL be 256x256 for the avatar and 1280x548 for the banner. The crop SHALL be applied to the video as displayed, after rotation metadata is applied.

#### Scenario: Prepared video is uploaded already framed
- **WHEN** preparation succeeds and the result is smaller than the original file
- **THEN** the client uploads the prepared file with no crop fields

#### Scenario: Unpreviewable video
- **WHEN** the video could not be previewed for cropping and the device can still decode it
- **THEN** the client prepares it with a centered crop at the slot's aspect ratio

#### Scenario: Portrait phone video
- **WHEN** a video carries rotation metadata
- **THEN** the prepared video shows the area the user framed, upright

### Requirement: Fallback to the original file
The client SHALL upload the original file with its normalized crop, as before this change, whenever preparation is unavailable, fails, or does not make the file smaller. Preparation failures SHALL NOT block the upload or show an error.

#### Scenario: Device without WebCodecs
- **WHEN** the browser has no `VideoEncoder` or `VideoDecoder`
- **THEN** the client uploads the original file with the normalized crop

#### Scenario: H.264 cannot be encoded
- **WHEN** the device cannot encode H.264 at the slot size
- **THEN** the client uploads the original file with the normalized crop

#### Scenario: Preparation throws
- **WHEN** preparation fails for any reason other than the user cancelling
- **THEN** the client uploads the original file with the normalized crop

#### Scenario: Result is not smaller
- **WHEN** the prepared file is the same size as or larger than the original
- **THEN** the client uploads the original file with the normalized crop

### Requirement: Preparation feedback and cancellation
While a video is being prepared, the client SHALL show the progress as a percentage, offer a cancel action, and disable the confirm and back actions. Cancelling SHALL stop the preparation and upload nothing.

#### Scenario: Progress is visible
- **WHEN** preparation is running
- **THEN** the uploader shows its progress and a cancel action

#### Scenario: User cancels
- **WHEN** the user cancels during preparation
- **THEN** no upload request is sent and the confirm step becomes available again

### Requirement: Processing status explains what stays visible
While a slot's latest upload is processing, the status SHALL say that the current avatar or banner stays visible until the new video is ready.

#### Scenario: Processing
- **WHEN** the owner's status for a slot is `processing`
- **THEN** the status shows the processing indicator and that the current media stays until the new video is ready
