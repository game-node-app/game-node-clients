const { execFileSync } = require("node:child_process");
const { readFileSync, readdirSync, rmSync, writeFileSync } = require("node:fs");
const { dirname, join } = require("node:path");
const { apps, git, releasePlan, output } = require("./release-plan.cjs");

function latestTag(app, cwd) {
  return git(cwd, "tag", "--list", `${app}@*`, "--sort=-version:refname")
    .split("\n")
    .find((tag) => new RegExp(`^${app}@\\d+\\.\\d+\\.\\d+$`).test(tag));
}

function releaseAt(ref, cwd) {
  return JSON.parse(git(cwd, "show", `${ref}:.release.json`));
}

function assertCurrent(release, cwd = process.cwd(), selectedApp) {
  if (selectedApp && !release.apps.includes(selectedApp))
    throw new Error("App is not selected in this release snapshot.");
  for (const app of selectedApp ? [selectedApp] : release.apps) {
    if (latestTag(app, cwd) !== `${app}@${release.versions[app]}`) {
      throw new Error(
        `${app} has a newer reserved release; refusing a stale deployment.`,
      );
    }
  }
}

function prepareRelease(plan, cwd = process.cwd(), publish = false) {
  const ref = `releases/${plan.source}`;
  if (!plan.apps.length) return { ...plan, ref: "", versions: {} };
  if (git(cwd, "tag", "--list", ref)) {
    const release = releaseAt(ref, cwd);
    if (
      release.source !== plan.source ||
      JSON.stringify(release.apps) !== JSON.stringify(plan.apps)
    ) {
      throw new Error(
        "Existing release snapshot does not match this release plan.",
      );
    }
    assertCurrent(release, cwd);
    return release;
  }
  if (git(cwd, "status", "--porcelain"))
    throw new Error("Release preparation requires a clean checkout.");
  if (git(cwd, "rev-parse", "HEAD") !== plan.source)
    throw new Error("Checkout must match the planned source commit.");

  const previous = {};
  for (const app of plan.apps) {
    const tag = latestTag(app, cwd);
    if (!tag) continue;
    previous[app] = { tag, release: releaseAt(tag, cwd) };
    git(
      cwd,
      "merge-base",
      "--is-ancestor",
      previous[app].release.source,
      plan.source,
    );
    if (previous[app].release.source === plan.source)
      throw new Error("This source already has an app release.");
  }

  git(cwd, "checkout", "--detach", plan.source);
  // Only this merge's declarations authorize this snapshot; main retains historical declarations.
  for (const file of readdirSync(join(cwd, ".changeset"))) {
    if (
      file.endsWith(".md") &&
      file !== "README.md" &&
      !plan.changesets.includes(`.changeset/${file}`)
    ) {
      rmSync(join(cwd, ".changeset", file));
    }
  }
  const originalVersions = Object.fromEntries(
    apps.map((app) => [
      app,
      JSON.parse(readFileSync(join(cwd, `apps/${app}/package.json`))).version,
    ]),
  );
  for (const app of plan.apps) {
    const manifestPath = join(cwd, `apps/${app}/package.json`);
    const manifest = JSON.parse(readFileSync(manifestPath));
    if (previous[app]) {
      manifest.version = previous[app].release.versions[app];
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      writeFileSync(
        join(cwd, `apps/${app}/CHANGELOG.md`),
        `${git(cwd, "show", `${previous[app].tag}:apps/${app}/CHANGELOG.md`)}\n`,
      );
    }
  }

  const cli = join(
    dirname(require.resolve("@changesets/cli/package.json")),
    "bin.js",
  );
  execFileSync(process.execPath, [cli, "version"], { cwd, stdio: "pipe" });
  const versions = {};
  for (const app of apps) {
    const version = JSON.parse(
      readFileSync(join(cwd, `apps/${app}/package.json`)),
    ).version;
    if (plan.apps.includes(app)) versions[app] = version;
    else if (version !== originalVersions[app])
      throw new Error(
        `Changesets unexpectedly versioned unselected app ${app}.`,
      );
  }
  if (plan.mobile) {
    const file = "apps/mobile/android/version.properties";
    const baseline = previous.mobile
      ? git(cwd, "show", `${previous.mobile.tag}:${file}`)
      : readFileSync(join(cwd, file), "utf8");
    const match = /^VERSION_CODE=(\d+)\s*$/.exec(baseline.trim());
    const code = match && Number(match[1]) + 1;
    if (!Number.isSafeInteger(code) || code < 1 || code > 2100000000)
      throw new Error("Invalid Android version code baseline.");
    writeFileSync(join(cwd, file), `VERSION_CODE=${code}\n`);
  }
  const release = { ...plan, ref, versions };
  writeFileSync(
    join(cwd, ".release.json"),
    `${JSON.stringify(release, null, 2)}\n`,
  );
  git(
    cwd,
    "add",
    "--",
    ".changeset",
    ...plan.apps.map((app) => `apps/${app}/package.json`),
    ...plan.apps.map((app) => `apps/${app}/CHANGELOG.md`),
  );
  if (plan.mobile)
    git(cwd, "add", "--", "apps/mobile/android/version.properties");
  git(cwd, "add", "--force", "--", ".release.json");
  git(
    cwd,
    "-c",
    "user.name=github-actions[bot]",
    "-c",
    "user.email=41898282+github-actions[bot]@users.noreply.github.com",
    "commit",
    "-m",
    `Release ${plan.source}`,
  );
  const tags = [ref, ...plan.apps.map((app) => `${app}@${versions[app]}`)];
  for (const tag of tags) git(cwd, "tag", tag);
  if (publish)
    git(
      cwd,
      "push",
      "--atomic",
      "origin",
      ...tags.map((tag) => `refs/tags/${tag}`),
    );
  return release;
}

if (require.main === module) {
  try {
    if (process.argv[2] === "--assert-current") {
      assertCurrent(
        JSON.parse(readFileSync(".release.json", "utf8")),
        process.cwd(),
        process.argv[3],
      );
    } else {
      output(
        prepareRelease(
          releasePlan(process.argv[2]),
          process.cwd(),
          process.argv.includes("--publish"),
        ),
      );
    }
  } catch (error) {
    console.error(error.stderr?.toString() || error.message);
    process.exitCode = 1;
  }
}

module.exports = { prepareRelease, assertCurrent, latestTag };
