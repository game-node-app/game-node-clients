# Verification

Verification started locally on 2026-10-31; later sections record hosted checks
and live setup. No production deployment, registry push, Play submission, or
remote release-tag publication has occurred yet.

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

## Initial lint blockers (resolved below)

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

## Initial rollout prerequisites and limits

The workflows have not run on GitHub yet. Docker images and signed native APK/AAB
builds were not exercised. Configure Docker/Coolify credentials, app UUID variables,
required `Checks` branch protection, and release-tag protection as described in
[the release guide](../../../docs/releases.md). Verify Android's checked-in
baseline against Play Console before releasing. An admin Coolify target has not
been identified. Existing signing secrets were verified by name only.

## Live setup and attempted release, 2026-10-31

- Copied `COOLIFY_URL` and `COOLIFY_TOKEN` from the server repository to clients
  using destination-key sealed-box encryption inside a temporary server Actions
  workflow. No plaintext was returned to the agent/session. The transfer artifact
  and temporary source branch were deleted; server main was unchanged.
- Configured `COOLIFY_WEB_APP_UUID=zscnp9ddbyuhkh4krgeyqh4i`.
- At the user's request, created `gamenode-admin` in the same production project
  and server, using the default Coolify destination, `lamarcke/game-node-admin`,
  container port `3000`, and `https://admin.gamenode.app`. Configured
  `COOLIFY_ADMIN_APP_UUID=xlhlnqt4dn7zxtxqppogzpej`. Instant deployment was disabled;
  the new application has not started a container.
- [Client deployment access verification](https://github.com/game-node-app/game-node-clients/actions/runs/41199978189)
  succeeded: Docker Hub login and authenticated Coolify reads verified both app
  identities and their expected images. Docker credentials are inherited and did
  not need copying. The temporary diagnostic branch was deleted.
- [PR #79](https://github.com/game-node-app/game-node-clients/pull/79) contains the
  implementation and an explicit web/admin patch-release changeset. The real
  [CI run](https://github.com/game-node-app/game-node-clients/actions/runs/41200009448)
  passed dependency installation, changeset validation, and all 14 release
  regression tests. Affected-code checks failed first on existing locales lint
  errors (`no-unused-vars` on type-signature parameters). Remaining lint debt is
  documented above. Snapshot reservation and delivery did not run.

Neither project has been deployed through the new pipeline. The requested live
release remains incomplete, pending successful hosted checks and delivery. No check was bypassed, no production image tag was changed,
and main was not merged or rewritten.

## Authorized application cleanup

The user approved clearing the lint backlog before real delivery. The shared
ESLint config now leaves unused-variable checks to the TypeScript rule instead of
also running the JavaScript rule on TS signatures. Unused variables still fail
validation, with a regression check for that behavior. Required unused callback
positions use the conventional underscore prefix.

TypeScript organized unused imports; production casts now use actual SDK/React
contracts, and test mocks use the contracts they emulate. Redundant effects were
replaced with derived values, guarded state synchronization, or event updates.
The report-discard payload guard, async cancellation, editor focus behavior, and
server-rendering safeguards were preserved. Admin transpilation now includes its
locales dependency instead of an unused analytics package.

Local verification now passes:

- Complete `turbo run lint type-check test build --affected --continue`: all 18 actual tasks succeed.
- 15 release/config regression tests pass.
- 103 mobile tests, including four focused error-message, mention-keyboard, and
  report-discard cases, pass; all 7 admin tests pass.
- Web's zero-warning lint policy passes; other workspaces retain non-blocking
  style/advisory warnings under their existing policies.
- Production Next builds for web/admin and Vite/Capacitor build/sync for mobile pass.

The real release task remains open until hosted CI succeeds and the published
web/admin images are verified in Coolify.

## Hosted cleanup verification and release security

[Hosted Checks on the lint-cleanup commit](https://github.com/game-node-app/game-node-clients/actions/runs/41203619411)
passed all affected lint, type, test, and build tasks. Main branch protection now
requires the GitHub Actions `Checks` context and an up-to-date branch; existing
review and protection settings were preserved.

The Sonar review prompted commit-pinned Actions, lifecycle-script-free installs,
and tighter Coolify URL/redirect handling. HTTP health probes use the two known
public domains, rather than API-returned URLs. Deployment UUIDs are encoded for
API paths; API-supplied values are not logged. Added regression coverage rejects unsafe origins,
path/log injection, and API-controlled health destinations. The release/config
suite now has 18 passing tests.

The Git process helper uses `/usr/bin/git` and argument arrays with no shell.
External refs accept ASCII Git names and ancestry expressions, reject option and
command syntax, and are resolved using `rev-parse --verify --end-of-options`.
A regression checks both base and head against unsafe arguments. Local release
tooling consequently requires Unix with Git at that path.

The duplicate mobile floating-label input and its identical CSS were removed;
its caller now uses the existing shared UI component. A focused render test
verifies object and callback class overrides.

A fresh pruned admin Docker build exposed UI peer dependencies that had been
supplied accidentally by sibling apps in full-workspace installs. Their existing
versions are now declared in UI peer requirements and supplied by admin. A fresh
web image builds with lifecycle scripts disabled and serves HTTP 200 as a non-root
user. The fresh admin image also builds and serves HTTP 200 as a non-root user.
Hosted checks and the required PR approval remain pending.
The release is not yet live.

Final cleanup rerun: all 18 affected lint/type/test/build tasks pass, including
104 mobile tests in 31 files, 7 admin tests, both Next production builds, and
mobile build/sync. All 18 release/config regressions pass. The input render test
passes with both object and callback class overrides.
