const { execFileSync } = require("node:child_process");
const { readFileSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");

const TITLES = { web: "Web", admin: "Admin", mobile: "Mobile" };

function parse(version) {
  return version.split(".").map(Number);
}

function compare(a, b) {
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

/** Highest `app@x.y.z` tag below `version`, or undefined for the first release. */
function previousTag(tags, app, version) {
  const pattern = new RegExp(`^${app}@(\\d+\\.\\d+\\.\\d+)$`);
  return tags
    .map((tag) => tag.match(pattern)?.[1])
    .filter((v) => v && compare(v, version) < 0)
    .sort(compare)
    .map((v) => `${app}@${v}`)
    .at(-1);
}

/** The `## version` section of a Changesets CHANGELOG, without its heading. */
function changelogSection(changelog, version) {
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return "";
  const end = lines.findIndex((line, i) => i > start && /^## /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join("\n")
    .replace(/^###/gm, "##")
    .trim();
}

function releaseBody(section, generated) {
  return [section, generated.trim()].filter(Boolean).join("\n\n");
}

function gh(args, options = {}) {
  return execFileSync("gh", args, { encoding: "utf8", ...options });
}

/**
 * Creates or updates the GitHub release for an app's reserved tag, so a
 * retried delivery converges on the same release and assets.
 */
function publishRelease(app, assets, cwd = process.cwd()) {
  if (!TITLES[app]) throw new Error(`Unknown app ${app}.`);
  const { version } = JSON.parse(
    readFileSync(join(cwd, "apps", app, "package.json"), "utf8"),
  );
  const tag = `${app}@${version}`;
  const tags = execFileSync("git", ["tag", "--list", `${app}@*`], {
    cwd,
    encoding: "utf8",
  }).split("\n");
  if (!tags.includes(tag)) throw new Error(`Missing release tag ${tag}.`);
  const previous = previousTag(tags, app, version);
  const generated = JSON.parse(
    gh([
      "api",
      "--method",
      "POST",
      "repos/{owner}/{repo}/releases/generate-notes",
      "-f",
      `tag_name=${tag}`,
      ...(previous ? ["-f", `previous_tag_name=${previous}`] : []),
    ]),
  ).body;
  const section = changelogSection(
    readFileSync(join(cwd, "apps", app, "CHANGELOG.md"), "utf8"),
    version,
  );
  const notes = join(process.env.RUNNER_TEMP || cwd, `${app}-release.md`);
  writeFileSync(notes, releaseBody(section, generated));
  const title = `${TITLES[app]} ${version}`;
  // Mobile is the user-facing download, so it owns the "Latest" badge.
  const latest = `--latest=${app === "mobile"}`;
  let exists = true;
  try {
    gh(["release", "view", tag, "--json", "tagName"], { stdio: "pipe" });
  } catch {
    exists = false;
  }
  if (exists)
    gh([
      "release",
      "edit",
      tag,
      "--title",
      title,
      "--notes-file",
      notes,
      latest,
    ]);
  else
    gh([
      "release",
      "create",
      tag,
      "--verify-tag",
      "--title",
      title,
      "--notes-file",
      notes,
      latest,
    ]);
  if (assets.length) gh(["release", "upload", tag, "--clobber", ...assets]);
  console.log(`Published GitHub release ${tag}.`);
}

if (require.main === module) {
  const [app, ...assets] = process.argv.slice(2);
  publishRelease(app, assets);
}

module.exports = { previousTag, changelogSection, releaseBody, publishRelease };
