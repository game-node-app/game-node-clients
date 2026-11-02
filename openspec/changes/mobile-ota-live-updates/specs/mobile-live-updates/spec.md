# Spec Delta

## Purpose

Deliver web-bundle updates to installed mobile apps without a store release, while never running a bundle against an incompatible native shell.

## ADDED Requirements

### Requirement: Publish bundle on mobile release

Each explicit mobile release SHALL publish its built web bundle and a manifest to public update hosting. The manifest SHALL be published only after its bundle is fully uploaded, and it SHALL list the bundle id, the bundle URL and the bundle's SHA-256 checksum.

#### Scenario: Mobile selected

- **WHEN** a release selects mobile and its build succeeds
- **THEN** the bundle is uploaded, then the manifest for its native fingerprint points to it

#### Scenario: Mobile not selected

- **WHEN** a release does not select mobile
- **THEN** no bundle or manifest is published

#### Scenario: Upload fails

- **WHEN** the bundle upload fails
- **THEN** the manifest is unchanged and the delivery job fails

### Requirement: Native compatibility gate

Bundles SHALL be grouped by a fingerprint of the native inputs. An installed app SHALL only consider bundles that have the same fingerprint as its native shell.

#### Scenario: JS-only change

- **WHEN** a release changes only web code
- **THEN** its fingerprint matches existing installs, and they are offered the bundle

#### Scenario: Native change

- **WHEN** a release changes a native plugin, Capacitor version, native project file or Capacitor config
- **THEN** its fingerprint differs, and existing installs are not offered the bundle

### Requirement: Background download and deferred apply

The app SHALL check for an update on launch and on resume. It SHALL download a newer compatible bundle in the background and apply it on the next launch, never while the user is using the app. If the check or download fails, the app SHALL keep running on the current bundle.

#### Scenario: Update available

- **WHEN** the manifest lists a bundle id different from the current one
- **THEN** the app downloads it and runs it on the next launch

#### Scenario: Offline or hosting down

- **WHEN** the manifest or bundle cannot be fetched
- **THEN** the app runs normally on its current bundle with no user-visible error

#### Scenario: Checksum mismatch

- **WHEN** the downloaded bundle's checksum does not match the manifest
- **THEN** the bundle is discarded and not applied

### Requirement: Automatic rollback

A newly applied bundle SHALL signal that it started successfully. If it does not do so within the ready timeout, the app SHALL revert to the bundle shipped with the installed app.

#### Scenario: Broken bundle

- **WHEN** an applied bundle crashes before signaling readiness
- **THEN** the next launch runs the bundle shipped with the installed app

### Requirement: Store update resets bundle

Installing a new native version from the store SHALL discard downloaded bundles and run the bundle shipped with that install.

#### Scenario: Store update

- **WHEN** a user on a downloaded bundle installs a newer store version
- **THEN** the app runs the store version's built-in bundle
