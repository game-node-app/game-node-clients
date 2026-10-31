# Design

## Context

See proposal.md. This is a Yarn 1/Turbo monorepo with manual Docker Hub and Android workflows. Changesets 3 requires Yarn 4, so retain Yarn 1 and pin the compatible Changesets 2 CLI. PR #78 is the latest merged main-branch PR and has no changeset. Only web has a verified Coolify application.

## Goals / Non-Goals

Goals: mandatory release decisions, independent app versions, affected-consumer CI, deterministic retries, and exact-source deployment.

Non-goals: npm publication, automatic Play Store submission, and refactoring unrelated application errors exposed by CI. The follow-up request authorizes copying existing Coolify credentials and testing actual web/admin delivery; an admin target must be identified before deployment.

## Decisions

1. Require newly added `.changeset/*.md` files relative to the PR merge base or push's previous main commit. Parse with the Changesets parser supplied by the CLI. Reject malformed, unsupported, internal-package, or empty-description release entries; an empty changeset is an explicit no-release decision. Never infer deployment targets from the dependency graph or old pending files.
2. Run affected lint, type checks, tests, and builds on PRs and main. Normalize task names and dependency declarations. Expose release planning as a read-only local command so historical PRs can be replayed without credentials.
3. On eligible main pushes, create a versioned detached release snapshot with Changesets, using each app's previous `app@version` tag as its version/changelog baseline. Reserve the snapshot under `releases/<source-sha>` and the selected app tags atomically. Main remains the source history; tagged snapshots contain published manifests and changelogs. This avoids racing bot commits against new main merges and avoids a release PR approval step. Reruns reuse the existing snapshot; older source commits cannot overwrite a newer app release. Serialize release workflows with a non-cancelling bounded FIFO queue. Main-branch changeset files remain historical declarations and only declarations newly introduced in a push are eligible.
4. Build only selected apps from the reserved snapshot. Web/admin images use the source SHA and version, with per-app Docker layer cache. Patch Coolify's Docker image tag and wait for deployment completion. Validate credentials and target configuration before publication. Use the same snapshot on retry; refuse to deploy a version superseded by a newer snapshot.
5. For mobile, use the package version as Android's versionName. Seed the package baseline from checked-in Gradle `1.8.12`; increment a committed native build-code baseline in the release snapshot, reusing the same code on reruns. Preserve signed APK/AAB artifacts and manual Play submission.

## Risks / Trade-offs

- Source manifests are bootstrap versions; published versions/changelogs live in release tags. Document this clearly and preserve tags.
- Explicit no-release merges remain in main and enter a later selected app's artifact. Selection does not isolate commits.
- Existing lint/type/build failures can block CI. Report failures without weakening validation or broad unrelated fixes.
- Coolify credentials and both target UUIDs are now configured and authenticated reads/registry login have been verified. Keep configuration validation before version reservation; never silently skip an explicitly selected target.
- GitHub concurrency queues are bounded and ordering follows queue entry. Refuse stale app releases rather than allowing a rollback.

## Migration Plan

Add configuration, scripts/tests, affected CI and selective release workflows; replace ungated manual publish workflows. The requested first live test explicitly selects web/admin patch releases. Replay PR #78 as a required missing-changeset failure and replay synthetic explicit app selection over its changed-file footprint. Configure repository secrets/variables and make the CI check required before the first live release. Roll back a live app by selecting a previously built immutable image through Coolify; do not rebuild old source as a new deployment.
