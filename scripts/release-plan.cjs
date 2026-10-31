const { execFileSync } = require("node:child_process");
const { appendFileSync } = require("node:fs");
const { createRequire } = require("node:module");

const apps = ["web", "admin", "mobile"];
const bumpTypes = ["patch", "minor", "major"];

function git(cwd, ...args) {
  // shortcut: release tooling targets Unix CI, add Git discovery if Windows support is needed.
  return execFileSync("/usr/bin/git", args, { cwd, encoding: "utf8" }).trim();
}

function releasePlan(base, head = "HEAD", cwd = process.cwd()) {
  if (!base) throw new Error("Usage: yarn release:plan <base-ref> [head-ref]");
  for (const ref of [base, head]) {
    if (
      typeof ref !== "string" ||
      !/^[a-zA-Z0-9][a-zA-Z0-9/_.@~^-]*$/.test(ref)
    )
      throw new Error(
        "Release refs must be ASCII Git names or ancestry expressions.",
      );
  }
  base = git(
    cwd,
    "rev-parse",
    "--verify",
    "--end-of-options",
    `${base}^{commit}`,
  );
  head = git(
    cwd,
    "rev-parse",
    "--verify",
    "--end-of-options",
    `${head}^{commit}`,
  );
  const files = git(
    cwd,
    "diff",
    "--no-renames",
    "--diff-filter=A",
    "--name-only",
    "-z",
    base,
    head,
    "--",
    ".changeset/",
  )
    .split("\0")
    .filter(
      (file) =>
        /^\.changeset\/[^/]+\.md$/.test(file) &&
        file !== ".changeset/README.md",
    );
  if (!files.length)
    throw new Error(
      "A new changeset is required. Use yarn changeset, or yarn changeset --empty to release nothing.",
    );

  const parse = createRequire(require.resolve("@changesets/cli/package.json"))(
    "@changesets/parse",
  ).default;
  const bumps = {};
  for (const file of files) {
    if (!git(cwd, "ls-tree", head, "--", file).startsWith("100644 blob ")) {
      throw new Error(`Changesets must be regular files: ${file}`);
    }
    const changeset = parse(git(cwd, "show", `${head}:${file}`));
    if (changeset.releases.length && !changeset.summary.trim()) {
      throw new Error(`A release summary is required: ${file}`);
    }
    for (const { name, type } of changeset.releases) {
      if (!apps.includes(name) || !bumpTypes.includes(type)) {
        throw new Error(
          `Explicit app releases only (web, admin, mobile), with patch/minor/major bumps: ${file}`,
        );
      }
      if (
        !bumps[name] ||
        bumpTypes.indexOf(type) > bumpTypes.indexOf(bumps[name])
      )
        bumps[name] = type;
    }
  }
  const selected = apps.filter((app) => bumps[app]);
  return {
    source: head,
    changesets: files,
    apps: selected,
    filters: [
      `--filter=...[${base}...${head}]`,
      ...selected.map((app) => `--filter=${app}...`),
    ],
    bumps,
    docker: selected.filter((app) => app !== "mobile"),
    mobile: selected.includes("mobile"),
  };
}

function validateDelivery(selected, env = process.env) {
  if (!Array.isArray(selected) || selected.some((app) => !apps.includes(app)))
    throw new Error("Invalid release app selection.");
  const required = [];
  if (selected.some((app) => app !== "mobile"))
    required.push(
      "DOCKER_USERNAME",
      "DOCKER_PASSWORD",
      "COOLIFY_URL",
      "COOLIFY_TOKEN",
    );
  for (const app of selected.filter((app) => app !== "mobile"))
    required.push(`COOLIFY_${app.toUpperCase()}_APP_UUID`);
  if (selected.includes("mobile"))
    required.push(
      "RELEASE_KEYSTORE",
      "RELEASE_KEYSTORE_PASS",
      "RELEASE_KEYSTORE_KEY_ALIAS",
      "RELEASE_KEYSTORE_KEY_PASS",
    );
  const missing = required.filter((key) => !env[key]?.trim());
  if (missing.length)
    throw new Error(`Missing delivery configuration: ${missing.join(", ")}`);
}

function output(values) {
  console.log(JSON.stringify(values, null, 2));
  if (process.env.GITHUB_OUTPUT) {
    for (const [key, value] of Object.entries(values)) {
      appendFileSync(
        process.env.GITHUB_OUTPUT,
        `${key}=${typeof value === "string" ? value : JSON.stringify(value)}\n`,
      );
    }
  }
}

if (require.main === module) {
  try {
    if (process.argv[2] === "--check-env")
      validateDelivery(JSON.parse(process.env.RELEASE_APPS));
    else output(releasePlan(process.argv[2], process.argv[3]));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { apps, git, releasePlan, output, validateDelivery };
