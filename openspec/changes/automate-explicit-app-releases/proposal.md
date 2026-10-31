# Proposal

## Why

Client releases are manual and do not distinguish successful CI from explicit intent to ship an app. Shared code must be checked across consumers without forcing every consumer into production.

## What Changes

- Require a new Changesets file on every PR; allow an empty changeset to explicitly release nothing.
- Release only explicitly named `web`, `admin`, and `mobile` apps after successful main-branch checks.
- Use dependency-aware CI, immutable versioned release snapshots, cached Docker builds, and Coolify deployment completion checks.
- Keep Android signed artifacts separate from web/admin deployment and automate native version inputs.
- Exercise the policy against merged PR #78 without deploying production.

## Capabilities

### New Capabilities

- `app-releases`: Explicit per-app release authorization, CI gating, immutable release versions, and selective delivery.

### Modified Capabilities

None.

## Impact

Changesets configuration/dependency, root release scripts/tests, GitHub workflows, app/package scripts and dependency declarations, Dockerfiles, Android version inputs, and contributor documentation. No application API or production data changes. Docker Hub and Coolify credentials are required for live deployment; they are currently absent from this repository.
