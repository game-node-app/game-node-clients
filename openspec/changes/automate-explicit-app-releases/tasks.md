# Tasks

## 1. Explicit release planning

- [x] 1.1 Install compatible Changesets tooling, configure app-only private versioning, and add an empty bootstrap changeset; verify CLI status.
- [x] 1.2 Implement merge-scoped release validation and immutable snapshot preparation with regression tests for missing/empty/invalid/app-only decisions and retry/version isolation; document contributor commands and tag ownership.

## 2. Selective CI and delivery

- [x] 2.1 Normalize workspace checks/dependencies and generated build outputs; verify affected Turbo task planning and report existing application check failures.
- [x] 2.2 Replace ungated publishing with required PR/main checks and app-selected Docker/Coolify/Android workflows; verify workflow syntax and mocked Coolify failure handling and document required credentials/targets.

## 3. Integration verification

- [x] 3.1 Replay latest merged PR #78 and explicit mobile-only/empty decisions over its source footprint without live delivery; record results and run release regression tests, relevant existing tests, formatting, and OpenSpec validation.

## 4. Requested live release test

- [x] 4.1 Copy Coolify credentials from the server repository without exposing plaintext and verify destination secret names and authenticated access.
- [x] 4.2 Configure web/admin delivery targets; verify both application identities and expected images before deployment.
- [x] 4.3 Fix the authorized application lint backlog without disabling validation and verify lint, types, tests, and affected builds.
- [ ] 4.4 Run the real explicit web/admin release through successful checks, verify registry images and live deployment health, and record the results without bypassing failed checks.
