# Client releases

Every PR targeting `main` must introduce a new `.changeset/*.md` file. Run:

```sh
yarn changeset
```

Select only the apps you intend to ship: `web`, `admin`, and/or `mobile`. Choose
their patch/minor/major bumps and write a release summary. Changes to `@repo/ui`,
locales, the wrapper, or configuration never implicitly authorize app releases.
The validator rejects internal-package names, unknown apps, invalid bump types,
release entries without summaries, and symlinked declarations.

To intentionally ship nothing, including when deferring a release, commit:

```sh
yarn changeset --empty
```

A missing changeset fails validation; an empty changeset passes and selects no
delivery jobs. Existing or edited historical declarations do not authorize a new
release. Use a new CLI-generated changeset for each PR.

## Checks and delivery

The `Checks` job validates release intent, runs the release regression suite, and
uses Turbo to lint, type-check, test, and build affected packages and consumers.
The workflow combines a Git-range filter with explicit selected-app filters, so
even a changeset-only release checks its selected app and dependencies.
For example, a shared UI change with a mobile-only changeset still checks affected
web/admin code, but only the Android delivery job is eligible.

On a successful main push, the workflow reserves a versioned snapshot and then:

- Web/admin: build selected Docker images, publish commit-SHA and app-version tags,
  update the selected Coolify Docker-image application to that exact SHA tag, wait
  for deployment completion, and check its fixed public HTTPS URL (gamenode.app or admin.gamenode.app).
  Preserve `latest` as a compatibility alias for the existing Compose examples;
  automated Coolify deployments always select the immutable SHA tag.
- Mobile: build signed APK/AAB artifacts using the app's semantic version and an
  increasing Android build code. Download the artifacts from the workflow run;
  Play Store submission remains manual.

Actions are pinned to exact commit SHAs. Dependency installs skip package
lifecycle scripts; builds and native synchronization run explicitly. Coolify API
requests refuse redirects, and public health checks never use API-provided URLs.

There are no ungated manual publish workflows. A release can be retried using
GitHub's rerun controls for its original workflow run. Main runs are serialized
without cancelling active deliveries; the pending queue holds up to 100 runs.

## Published versions and retries

**Release tags are the version history.** Main's package versions are bootstrap
baselines, not necessarily the versions currently deployed. The mobile baseline
is aligned with the existing Gradle version `1.8.12` and build code `61`; verify
these against Play Console before the first live mobile release.

The workflow applies the standard Changesets version command in a detached
snapshot. It reads each selected app's previous version and changelog from its
last `app@version` tag. It atomically pushes:

- `releases/<main-source-sha>`: the versioned commit containing release metadata,
  app manifests, changelogs, and consumed declarations.
- `web@<version>`, `admin@<version>`, and/or `mobile@<version>`: only selected apps,
  pointing to the same snapshot.

Main is never rewritten or updated by a version bot. Changeset files remain on
main as historical release decisions; the planner considers only files newly
introduced by the current PR/push. Do not run `changeset version` on main or
manually publish these private workspaces to npm.

Retries reuse the original snapshot, versions, and Android code. Docker retries
reuse an already published SHA image. A reserved version can belong to a failed
delivery; use the workflow result and Coolify to determine what is deployed.
Each delivery job refuses a retry only if that app has a newer reservation;
another app's release does not prevent retrying a failed delivery. Do not
delete, move, or reuse release tags. Multiple changesets for the same app combine
into the highest requested bump in that push.

## Repository setup

`Checks` is required by main-branch protection, with an up-to-date branch required.
The existing approval requirement is preserved. The workflow itself cannot enforce
merge protection. Protect release tags from manual
updates/deletion and allow the workflow token to create them (`contents: write`).

Configure these repository secrets before selecting web or admin:

- `DOCKER_USERNAME`, `DOCKER_PASSWORD`: push access to the existing
  `lamarcke/game-node-web` and `lamarcke/game-node-admin` Docker Hub repositories.
- `COOLIFY_URL`: HTTPS Coolify origin, without a path, credentials, or query string.
- `COOLIFY_TOKEN`: access to read/update/deploy the selected applications.

Configure repository variables:

- `COOLIFY_WEB_APP_UUID`: the existing web application is
  `zscnp9ddbyuhkh4krgeyqh4i`.
- `COOLIFY_ADMIN_APP_UUID`: the admin application is
  `xlhlnqt4dn7zxtxqppogzpej`, created alongside web in GameNode production for
  `https://admin.gamenode.app`.

Each target must use Coolify's Docker image build pack and the expected Docker
Hub image. Both configured targets meet that requirement. The server's Compose image-env
update mechanism is different and is not used here. Configure registry pull
credentials in Coolify if the images are private.

Mobile uses the existing `RELEASE_KEYSTORE`, `RELEASE_KEYSTORE_PASS`,
`RELEASE_KEYSTORE_KEY_ALIAS`, and `RELEASE_KEYSTORE_KEY_PASS` secrets. The `production`
environment is shared by the delivery jobs; any environment approvals also apply.
Configuration for every selected target is checked before reserving versions.

Coolify credentials were copied from `game-node-server` using a temporary workflow
that encrypted the values with this repository's GitHub public key. Their plaintext
was never returned to the local session. The transfer artifact and source branch
were deleted. A separate Actions access check verified Docker Hub login and
authenticated reads of both configured Coolify applications.

## Local verification

```sh
yarn test:releases
yarn release:plan <base-sha> <head-sha>
yarn turbo run lint type-check test build --affected
```

For PR replay, compare the PR's merge base with its head, or a merged PR's first
parent with its merge commit. For main pushes, the workflow uses the push's exact
`before` and `after` commits so a multi-commit push includes all new declarations.
Local release tooling uses `/usr/bin/git` on Unix; refs accept ASCII Git names
and ancestry expressions. Planning does not publish, tag, sign, or deploy anything. Snapshot preparation is
a write operation intended for a clean CI checkout; it detaches HEAD and creates
tags. Its regression tests run in disposable local repositories.

Roll back production by selecting a previous immutable image tag in Coolify.
Re-running an obsolete release is intentionally rejected. Code merged with an
empty changeset remains on main and enters that app's next selected release;
selection controls release timing, not commit isolation. Mobile clients remain
in circulation, so server changes must preserve compatibility with older apps.
