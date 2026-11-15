# Spec Delta

## Purpose

Defines how supporters set an avatar or banner video from a link in the clients, how the link is checked before it is sent, and how the outcome is shown.

## ADDED Requirements

### Requirement: Link input for supporters
The avatar and banner video uploaders SHALL offer supporters a field to paste a link and a button to submit it, alongside the file dropzone. Non-supporters SHALL NOT see the field and SHALL keep the supporter notice.

#### Scenario: Supporter opens the uploader
- **WHEN** a supporter opens the avatar or banner uploader
- **THEN** the dropzone and the link field are both available

#### Scenario: Non-supporter opens the uploader
- **WHEN** a user who is not a supporter opens the uploader
- **THEN** no link field is shown and the supporter notice is shown as before

### Requirement: Link checks before sending
Before calling the server, the client SHALL extract the first `https` link from the pasted text and accept it only when its host is `youtube.com`, `youtu.be`, `tiktok.com`, `instagram.com`, `x.com` or `twitter.com`, or a subdomain of one of them. Any other input SHALL show a message and send nothing.

#### Scenario: Shared text with a title
- **WHEN** the user pastes `Great clip https://youtu.be/abc123`
- **THEN** only `https://youtu.be/abc123` is sent

#### Scenario: Unsupported link
- **WHEN** the user pastes a link on any other host, an `http` link, or text without a link
- **THEN** the client shows that the link is not supported and sends nothing

#### Scenario: Empty field
- **WHEN** the field is empty
- **THEN** the submit button is disabled

### Requirement: Submission and status
Submitting a valid link SHALL call `POST /v1/profile/video/link` with the slot and the link and no crop, treat 202 as accepted and start the same status tracking as a file upload. A 409 SHALL be treated as "already processing", and the confirm step SHALL say the video will be centered because a linked video cannot be previewed.

#### Scenario: Accepted link
- **WHEN** the server answers 202
- **THEN** the uploader closes, a success message is shown, and the slot shows `processing` until it becomes `ready` or `failed`

#### Scenario: Slot already processing
- **WHEN** the server answers 409
- **THEN** the client starts tracking the slot and shows the already-processing message

#### Scenario: No crop for links
- **WHEN** the user submits a link
- **THEN** no crop fields and no client-side preparation are used

### Requirement: Link failure messages
The client SHALL show a localized message for each failure: the link error codes `download_unsupported`, `download_too_large` and `download_failed` in the slot status, 400 as an unsupported link, 403 as supporter-only, 429 as throttled, and 404 as the feature being unavailable. A 404 SHALL hide the link field for the rest of the session.

#### Scenario: Private video
- **WHEN** the status ends `failed` with `download_unsupported`
- **THEN** the slot shows a message that the video cannot be downloaded and the current media stays

#### Scenario: Feature switched off
- **WHEN** the server answers 404 to a link submission
- **THEN** the client shows that links are unavailable and stops offering the field
