# Spec Delta

## Purpose

Let developers explicitly release individual client apps after successful checks without releasing other consumers of shared code.

## ADDED Requirements

### Requirement: Mandatory explicit release decisions

Every PR SHALL introduce a valid changeset. Only explicitly named deployable apps SHALL be eligible for release. Empty changesets SHALL explicitly select no apps.

#### Scenario: Missing decision

- **WHEN** a PR or main push introduces no changeset
- **THEN** release validation fails and no delivery starts

#### Scenario: Mobile only

- **WHEN** shared code changes and a changeset selects only mobile
- **THEN** web and admin are not released

#### Scenario: Explicit no release

- **WHEN** a PR introduces an empty changeset
- **THEN** validation succeeds and no app is released

#### Scenario: Old or invalid declarations

- **WHEN** only an old changeset exists or a new changeset names an internal or unknown package
- **THEN** it cannot authorize deployment

### Requirement: Successful checks precede delivery

The system SHALL check affected apps and shared dependencies independently of release selection. Delivery SHALL require successful checks for the main source commit.

#### Scenario: Shared code affects unselected apps

- **WHEN** a shared dependency changes and only mobile is selected
- **THEN** affected web and admin checks still run

#### Scenario: Failed checks

- **WHEN** a required check fails
- **THEN** no selected app is delivered

### Requirement: Immutable independently versioned releases

Selected apps SHALL receive independent semantic versions and immutable source-linked artifacts. Retries SHALL reuse the existing release snapshot and versions. A stale release SHALL NOT replace a newer app release.

#### Scenario: Retry

- **WHEN** delivery is retried for an already reserved source commit
- **THEN** it uses the same versioned snapshot and native build code

#### Scenario: Concurrent release history

- **WHEN** another app has already been released
- **THEN** its version does not change unless explicitly selected

### Requirement: Selective app delivery

Web and admin SHALL publish immutable Docker images and deploy their configured Coolify application, reporting deployment failures. Mobile SHALL produce signed Android artifacts with an increasing native build code without publishing to Play automatically.

#### Scenario: Missing target configuration

- **WHEN** a selected delivery target lacks required credentials or configuration
- **THEN** the release fails visibly before publishing artifacts

#### Scenario: Coolify failure

- **WHEN** Coolify rejects or fails a deployment
- **THEN** the workflow reports failure rather than successful delivery

#### Scenario: Mobile release

- **WHEN** only mobile is selected and checks pass
- **THEN** signed APK/AAB artifacts are produced using the selected semantic version and native build code
