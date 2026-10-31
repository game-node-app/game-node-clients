# Verification

Verified locally on 2026-10-31. No production deployment, registry push, Play
submission, repository-setting update, or remote release-tag publication occurred.

## Latest merged PR replay

Source: [PR #78, Rework platform achievement catalog](https://github.com/game-node-app/game-node-clients/pull/78),
merge commit `41da685357592640844f340f7bfaba2ea014deac`, compared with its first
parent. The original PR has no changeset.

- Original PR: release validation rejects the missing changeset; no app is authorized.
- Disposable clone with the original PR's source plus the new release configuration
  and a synthetic mobile-only changeset: mobile becomes `1.8.13`, Android code `62`,
  web stays `1.7.27`, admin stays `1.6.3`. Only local snapshot tags were created.
- Same source with a synthetic empty changeset: validation passes and no app is selected.

These are policy replays, not a retroactive authorization to deploy PR #78.

## Passing checks

- `yarn test:releases`: 14 tests pass, including actual Changesets versioning in
  disposable Git repositories, per-app version/changelog isolation, stable retries,
  stale-release refusal, independent delivery retries, native code increments,
  atomic tag publication to a disposable local bare repository, real Turbo task
  selection for changeset-only releases, and mocked Coolify error/health handling.
- `yarn workspace admin test --runInBand`: 7 tests pass in 2 suites, including PR #78's catalog tests.
- `yarn workspace mobile test`: 99 tests pass in 27 files, including PR #78's achievement/activity/notification tests.
- `yarn turbo run type-check --affected`: all 7 actual tasks pass (wrapper generation plus 6 workspace type checks).
- `yarn turbo run build --filter=mobile`: Vite production build and Capacitor sync pass.
- Frozen-lockfile installation, Changesets status, Turbo dry task planning, JavaScript
  syntax checks, changed-file formatting, Git whitespace validation, and strict
  OpenSpec validation pass.
- Actionlint 1.7.12 finds no errors after excluding its unsupported `concurrency.queue`
  key diagnostic. `queue: max` is supported by the current
  [GitHub Actions concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).
  That single field has documentation/YAML validation rather than actionlint coverage.

## Existing lint blockers

The new affected lint run fails on existing source violations. They are not
suppressed or accepted as successful checks:

- Shared UI: 1,257 errors, 146 warnings.
- Mobile: 655 errors, 616 warnings.
- Admin: 4 errors, 68 warnings.
- Locales: 2 errors.
- Web: 93 warnings, failing its existing zero-warning policy.

The run initially exposed a wrapper generation/type-check race; task dependencies
were corrected and the full workspace type-check rerun passes. Lint failures
still block main release delivery. Broad lint cleanup is outside this change.

## Rollout prerequisites and limits

The workflows have not run on GitHub yet. Docker images and signed native APK/AAB
builds were not exercised. Configure Docker/Coolify credentials, app UUID variables,
required `Checks` branch protection, and release-tag protection as described in
[the release guide](../../../docs/releases.md). Verify Android's checked-in
baseline against Play Console before releasing. An admin Coolify target has not
been identified. Existing signing secrets were verified by name only.
