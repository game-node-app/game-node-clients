const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  symlinkSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { dirname, join, resolve } = require("node:path");
const { test } = require("node:test");
const { apps, git, releasePlan } = require("./release-plan.cjs");
const { prepareRelease, assertCurrent } = require("./prepare-release.cjs");

const root = resolve(__dirname, "..");
function write(cwd, path, value) {
  mkdirSync(dirname(join(cwd, path)), { recursive: true });
  writeFileSync(
    join(cwd, path),
    typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
  );
}
function commit(cwd) {
  git(cwd, "add", ".");
  git(cwd, "commit", "-qm", "Fixture change");
  return git(cwd, "rev-parse", "HEAD");
}
function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "client-release-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  git(cwd, "init", "-qb", "main");
  git(cwd, "config", "user.name", "Release test");
  git(cwd, "config", "user.email", "release@example.test");
  write(cwd, ".gitignore", "node_modules\n.release.json\n");
  write(cwd, "package.json", {
    name: "release-fixture",
    private: true,
    workspaces: ["apps/*", "packages/*"],
  });
  for (const app of apps) {
    write(cwd, `apps/${app}/package.json`, {
      name: app,
      version: app === "mobile" ? "1.8.12" : "1.0.0",
      private: true,
      dependencies: { "@repo/ui": "*" },
    });
  }
  write(cwd, "packages/ui/package.json", {
    name: "@repo/ui",
    version: "0.0.0",
    private: true,
  });
  write(cwd, "apps/mobile/android/version.properties", "VERSION_CODE=61\n");
  write(
    cwd,
    ".changeset/config.json",
    readFileSync(join(root, ".changeset/config.json"), "utf8"),
  );
  write(cwd, ".changeset/README.md", "# Changesets\n");
  symlinkSync(join(root, "node_modules"), join(cwd, "node_modules"), "dir");
  return { cwd, base: commit(cwd) };
}
function declaration(cwd, id, targets, summary = "Release selected apps") {
  write(
    cwd,
    `.changeset/${id}.md`,
    `---\n${Object.entries(targets)
      .map(([app, bump]) => `"${app}": ${bump}\n`)
      .join("")}---\n\n${summary}\n`,
  );
}

test("missing, existing, and modified changesets do not authorize releases", (t) => {
  const { cwd, base } = fixture(t);
  write(cwd, "packages/ui/index.ts", "export const changed = true;\n");
  const head = commit(cwd);
  assert.throws(
    () => releasePlan(base, head, cwd),
    /new changeset is required/,
  );
  declaration(cwd, "old", { web: "patch" });
  const old = commit(cwd);
  declaration(cwd, "old", { mobile: "patch" });
  const modified = commit(cwd);
  assert.throws(
    () => releasePlan(old, modified, cwd),
    /new changeset is required/,
  );
});

test("shared changes only release explicitly selected mobile", (t) => {
  const { cwd, base } = fixture(t);
  write(cwd, "packages/ui/index.ts", "export const shared = true;\n");
  declaration(cwd, "mobile-only", { mobile: "minor" });
  const plan = releasePlan(base, commit(cwd), cwd);
  assert.deepEqual(plan.apps, ["mobile"]);
  assert.deepEqual(plan.docker, []);
  assert.equal(plan.mobile, true);
  assert.ok(plan.filters.includes("--filter=mobile..."));
  assert.ok(plan.filters[0].startsWith("--filter=...["));
});

test("release refs reject options, whitespace, and shell syntax", (t) => {
  const { cwd, base } = fixture(t);
  declaration(cwd, "ref-validation", { web: "patch" });
  commit(cwd);
  assert.deepEqual(releasePlan(base, "HEAD", cwd).apps, ["web"]);
  for (const ref of [
    "--help",
    "HEAD\n",
    "HEAD;touch marker",
    "$(touch marker)",
    "HEAD:path",
  ]) {
    assert.throws(() => releasePlan(ref, "HEAD", cwd), /Release refs/);
    assert.throws(() => releasePlan(base, ref, cwd), /Release refs/);
  }
});

test("empty changesets pass without selecting delivery jobs", (t) => {
  const { cwd, base } = fixture(t);
  declaration(cwd, "no-release", {}, "");
  const plan = releasePlan(base, commit(cwd), cwd);
  assert.deepEqual(plan.apps, []);
  assert.equal(prepareRelease(plan, cwd).ref, "");
  assert.equal(git(cwd, "tag", "--list"), "");
});

test("invalid names, bump types, summaries, and markdown fail closed", (t) => {
  for (const [name, targets, summary] of [
    ["internal", { "@repo/ui": "patch" }, "Shared change"],
    ["unknown", { backend: "minor" }, "Unknown app"],
    ["invalid-bump", { web: "banana" }, "Invalid bump"],
    ["empty-summary", { admin: "patch" }, ""],
  ]) {
    const { cwd, base } = fixture(t);
    declaration(cwd, name, targets, summary);
    assert.throws(() => releasePlan(base, commit(cwd), cwd));
  }
  const { cwd, base } = fixture(t);
  write(cwd, ".changeset/malformed.md", "Not a changeset");
  assert.throws(() => releasePlan(base, commit(cwd), cwd));
});

test("changeset symlinks cannot authorize releases", (t) => {
  const { cwd, base } = fixture(t);
  write(cwd, "outside.md", '---\n"web": patch\n---\nShip web\n');
  symlinkSync("../outside.md", join(cwd, ".changeset/link.md"));
  assert.throws(() => releasePlan(base, commit(cwd), cwd), /regular files/);
});

test("multiple declarations combine explicit apps and use the highest bump", (t) => {
  const { cwd, base } = fixture(t);
  declaration(cwd, "web", { web: "patch" });
  declaration(cwd, "admin-web", { web: "minor", admin: "patch" });
  const plan = releasePlan(base, commit(cwd), cwd);
  assert.deepEqual(plan.apps, ["web", "admin"]);
  assert.deepEqual(plan.bumps, { admin: "patch", web: "minor" });
  assert.equal(plan.mobile, false);
});

test("real Changesets snapshots retain independent versions, retry identity, and Android codes", (t) => {
  const { cwd, base } = fixture(t);
  declaration(cwd, "mobile-first", { mobile: "patch" });
  const firstSource = commit(cwd);
  const firstPlan = releasePlan(base, firstSource, cwd);
  const first = prepareRelease(firstPlan, cwd);
  const snapshot = git(cwd, "rev-parse", first.ref);
  assert.deepEqual(first.versions, { mobile: "1.8.13" });
  assert.equal(
    git(cwd, "show", `${first.ref}:apps/mobile/android/version.properties`),
    "VERSION_CODE=62",
  );
  assert.equal(git(cwd, "rev-parse", "main"), firstSource);
  assert.deepEqual(prepareRelease(firstPlan, cwd), first);
  assert.equal(git(cwd, "rev-parse", first.ref), snapshot);

  git(cwd, "checkout", "main");
  declaration(cwd, "web-second", { web: "minor" });
  const secondSource = commit(cwd);
  const second = prepareRelease(
    releasePlan(firstSource, secondSource, cwd),
    cwd,
  );
  assert.deepEqual(second.versions, { web: "1.1.0" });
  assert.equal(git(cwd, "tag", "--list", "mobile@*"), "mobile@1.8.13");

  git(cwd, "checkout", "main");
  declaration(cwd, "mobile-third", { mobile: "patch" });
  const thirdSource = commit(cwd);
  const third = prepareRelease(
    releasePlan(secondSource, thirdSource, cwd),
    cwd,
  );
  assert.deepEqual(third.versions, { mobile: "1.8.14" });
  assert.equal(
    git(cwd, "show", `${third.ref}:apps/mobile/android/version.properties`),
    "VERSION_CODE=63",
  );
  assert.match(
    git(cwd, "show", `${third.ref}:apps/mobile/CHANGELOG.md`),
    /1\.8\.13/,
  );
  assert.throws(() => prepareRelease(firstPlan, cwd), /stale deployment/);
});

test("GitHub outputs contain usable refs and JSON matrices", (t) => {
  const { cwd, base } = fixture(t);
  declaration(cwd, "web", { web: "patch" });
  const head = commit(cwd);
  const outputPath = join(tmpdir(), `release-output-${head}`);
  t.after(() => rmSync(outputPath, { force: true }));
  execFileSync(
    process.execPath,
    [join(root, "scripts/release-plan.cjs"), base, head],
    {
      cwd,
      env: { ...process.env, GITHUB_OUTPUT: outputPath },
    },
  );
  const output = readFileSync(outputPath, "utf8");
  assert.match(output, new RegExp(`source=${head}\\n`));
  assert.match(output, /docker=\["web"\]/);
});

test("publishes snapshot and selected app tags atomically without updating main", (t) => {
  const { cwd, base } = fixture(t);
  const remote = mkdtempSync(join(tmpdir(), "client-release-origin-"));
  t.after(() => rmSync(remote, { recursive: true, force: true }));
  git(remote, "init", "--bare", "-q");
  git(cwd, "remote", "add", "origin", remote);
  git(cwd, "push", "-q", "origin", "main");
  declaration(cwd, "web-admin", { web: "patch", admin: "minor" });
  const source = commit(cwd);
  const release = prepareRelease(releasePlan(base, source, cwd), cwd, true);
  assert.deepEqual(release.versions, { web: "1.0.1", admin: "1.1.0" });
  assert.equal(git(remote, "rev-parse", "refs/heads/main"), base);
  assert.equal(
    git(remote, "rev-parse", `refs/tags/${release.ref}`),
    git(remote, "rev-parse", "refs/tags/web@1.0.1"),
  );
  assert.equal(git(remote, "tag", "--list", "mobile@*"), "");

  git(cwd, "checkout", "main");
  declaration(cwd, "admin-next", { admin: "patch" });
  prepareRelease(releasePlan(source, commit(cwd), cwd), cwd);
  assert.doesNotThrow(() => assertCurrent(release, cwd, "web"));
  assert.throws(() => assertCurrent(release, cwd, "admin"), /stale deployment/);
});

test("changeset-only releases still select the app and dependencies for real Turbo checks", (t) => {
  const { cwd } = fixture(t);
  const manifest = JSON.parse(readFileSync(join(cwd, "package.json")));
  write(cwd, "package.json", { ...manifest, packageManager: "yarn@1.22.22" });
  write(cwd, "yarn.lock", "# yarn lockfile v1\n");
  write(cwd, "turbo.json", {
    tasks: { build: { dependsOn: ["^build"] }, lint: {} },
  });
  for (const path of [
    ...apps.map((app) => `apps/${app}/package.json`),
    "packages/ui/package.json",
  ]) {
    const pkg = JSON.parse(readFileSync(join(cwd, path)));
    write(cwd, path, {
      ...pkg,
      scripts: { build: "node --version", lint: "node --version" },
    });
  }
  const base = commit(cwd);
  declaration(cwd, "mobile-release-only", { mobile: "patch" });
  const plan = releasePlan(base, commit(cwd), cwd);
  const taskPlan = JSON.parse(
    execFileSync(
      join(root, "node_modules/.bin/turbo"),
      ["run", "lint", "build", ...plan.filters, "--dry=json"],
      { cwd, encoding: "utf8" },
    ),
  );
  assert.ok(taskPlan.tasks.some((task) => task.taskId === "mobile#lint"));
  assert.ok(taskPlan.tasks.some((task) => task.taskId === "@repo/ui#lint"));
  assert.deepEqual(plan.docker, []);
});
