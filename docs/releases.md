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
  increasing Android build code, and publish the web bundle to R2 for compatible
  installs. Download the artifacts from the workflow run; Play Store submission
  remains manual.

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

## Mobile live updates

Create an R2 bucket dedicated to public mobile bundles, attach an HTTPS custom
domain, and create an R2 API token with Object Read & Write access scoped to that
bucket. See Cloudflare's [token setup](https://developers.cloudflare.com/r2/api/tokens/)
and [CORS configuration](https://developers.cloudflare.com/r2/buckets/cors/).
Allow public `GET` and `HEAD` requests with this bucket CORS policy (the Android
WebView fetches the manifest from `https://localhost`):

```json
[
  {
    "AllowedOrigins": ["https://localhost"],
    "AllowedMethods": ["GET", "HEAD"]
  }
]
```

Configure repository secrets, alongside the four Android signing secrets above:

- `R2_ACCESS_KEY_ID`: the scoped token's S3 access key ID.
- `R2_SECRET_ACCESS_KEY`: the token's S3 secret access key.

Configure these additional repository secrets:

- `R2_ACCOUNT_ID`: the Cloudflare account ID for the S3 endpoint
  `https://<account-id>.r2.cloudflarestorage.com`.
- `R2_BUCKET`: the bucket name.
- `LIVE_UPDATE_PUBLIC_URL`: the public HTTPS custom-domain origin, such as
  `https://updates.example.com`, with no path or query. The delivery build passes
  this into `VITE_PUBLIC_LIVE_UPDATE_URL`; `.env.production` leaves it empty for
  local builds unless explicitly supplied. An empty URL disables update checks.

These values must be repository scoped so the `prepare` job can validate them
before reserving a release. Configure the bucket and credentials in Cloudflare
and GitHub settings; publishing runs only in Actions when a new changeset selects
`mobile`. No developer-machine upload is part of the release flow.

The delivery job zips the contents of `apps/mobile/dist` with `index.html` at the
archive root. It uploads `ota/<fingerprint>/<version>-<short-sha>.zip` with
`Cache-Control: public, max-age=31536000, immutable`, then uploads
`ota/<fingerprint>/latest.json` with `Cache-Control: no-cache`. The manifest contains
`bundleId`, the public HTTPS `url`, and the zip's SHA-256 `checksum` in hex. A failed
zip upload stops the job before replacing the manifest. Keep Cloudflare cache
rules from overriding the manifest's cache header.

`node scripts/native-fingerprint.cjs` hashes tracked Android files except
`version.properties`, Capacitor config, and installed native plugin/runtime
versions. Commit the generated Gradle changes from `cap sync` with plugin changes
so build-time and publish-time fingerprints agree. JS-only and release-version
changes preserve the fingerprint; native changes get a separate update path.

The listener confirms startup with `ready()`, checks on launch and resume,
downloads a matching bundle with checksum verification, and activates it on the
next launch. Offline failures are logged without blocking the app. If startup
does not signal readiness within 10 seconds, Capawesome resets to the bundle
shipped with the installed app; the next launch uses that bundle. Installing a
new store build resets downloaded bundles. The first release containing the
plugin must be installed through the Play Store before OTA can reach those users.

To roll back distribution, overwrite `ota/<fingerprint>/latest.json` with the
previous bundle's **full manifest**, retaining its URL and checksum, or delete it
to stop offering updates. Never replace an immutable zip with different bytes.
Deleting the manifest does not revert bundles that already signaled readiness;
those users need a manifest pointing to a known working bundle. A startup failure
recovers to the installed app's shipped bundle through the ready timeout. Withdraw
a broken manifest to prevent repeated downloads of that bundle. The bucket and
manifest are trusted together; the checksum detects corruption, not a compromised
publisher. Bundle signing and staged rollouts are out of scope.

Before rollout, verify download/next-launch activation and offline startup on an
Android device, then test a bundle that throws before `ready()` and wait past the
10-second timeout before relaunching. After merging, verify the first Actions
upload and both public URLs. After installing that store build, release a JS-only
changeset and confirm OTA delivery; a plugin-version release must use a different
fingerprint and must not reach the old shell.

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
The OTA workflow regression also needs `zip`, `unzip`, and `jq` (already present
on GitHub runners); it reports a skip locally if any of those tools is missing.

Roll back production by selecting a previous immutable image tag in Coolify.
Re-running an obsolete release is intentionally rejected. Code merged with an
empty changeset remains on main and enters that app's next selected release;
selection controls release timing, not commit isolation. Mobile clients remain
in circulation, so server changes must preserve compatibility with older apps.
