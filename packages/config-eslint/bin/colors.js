#!/usr/bin/env node
"use strict";

/**
 * Legacy baseline of `gamenode/no-hard-coded-colors`.
 *
 *   node bin/colors.js check [--all]     fail on new or grown violations
 *   node bin/colors.js baseline [--force] rewrite color-baseline.json
 *
 * Root scripts: `pnpm colors:check` and `pnpm colors:baseline`. Each package's
 * `lint` script runs `check` for its own package (the cwd), so `turbo lint`
 * enforces it too. `check` fails when (1) a file outside the baseline has any
 * violation, or (2) a baseline file has more violations than recorded.
 * Fewer violations are fine; run `colors:baseline` to lock the progress in.
 * `baseline` refuses to record growth unless `--force` is passed.
 */

const path = require("node:path");

const {
  BASELINE_FILE,
  COLOR_ENFORCED_PACKAGES,
} = require("../hard-coded-colors");
const {
  REPO_ROOT,
  compareWithBaseline,
  countColorViolations,
  loadColorBaseline,
  writeBaseline,
} = require("../color-baseline-tools");

function packagesFor(args) {
  if (args.includes("--all")) return [...COLOR_ENFORCED_PACKAGES];

  const relative = path
    .relative(REPO_ROOT, process.cwd())
    .split(path.sep)
    .join("/");
  const match = COLOR_ENFORCED_PACKAGES.find(
    (pkg) => relative === pkg || relative.startsWith(`${pkg}/`),
  );

  if (match) return [match];

  // Repo root (or a package that is not enforced, such as admin).
  return relative === "" ? [...COLOR_ENFORCED_PACKAGES] : [];
}

function report({ added, grown, shrunk }) {
  for (const { file, count } of added) {
    process.stdout.write(
      `  new      ${file}: ${count} hard-coded color(s) (file is not in the baseline)\n`,
    );
  }

  for (const { file, count, baseline } of grown) {
    process.stdout.write(
      `  grew     ${file}: ${baseline} -> ${count} hard-coded color(s)\n`,
    );
  }

  void shrunk;
}

async function main() {
  const [command = "check", ...args] = process.argv.slice(2);

  if (command === "baseline") {
    const counts = await countColorViolations();
    const baseline = loadColorBaseline(BASELINE_FILE);
    const diff = compareWithBaseline(counts, baseline);
    const hasBaseline = Object.keys(baseline).length > 0;

    if (
      hasBaseline &&
      (diff.added.length > 0 || diff.grown.length > 0) &&
      !args.includes("--force")
    ) {
      process.stdout.write(
        "Refusing to grow the color baseline. Fix these violations (use theme tokens), or pass --force if they are intentional legacy code:\n",
      );
      report(diff);
      process.exitCode = 1;
      return;
    }

    writeBaseline(counts);

    const files = Object.keys(counts).length;
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    process.stdout.write(
      `Wrote ${path.relative(REPO_ROOT, BASELINE_FILE)}: ${total} violation(s) in ${files} file(s).\n`,
    );
    return;
  }

  if (command !== "check") {
    process.stderr.write(
      `Unknown command '${command}'. Use check or baseline.\n`,
    );
    process.exitCode = 2;
    return;
  }

  const packages = packagesFor(args);
  if (packages.length === 0) return;

  const counts = await countColorViolations({ packages });
  const diff = compareWithBaseline(counts, loadColorBaseline(), packages);

  if (diff.added.length > 0 || diff.grown.length > 0) {
    process.stdout.write(
      'colors:check failed. New code must use theme tokens instead of fixed colors (see AGENTS.md, "UI colors"):\n',
    );
    report(diff);
    process.stdout.write(
      "\nFix the violations (or mark real artwork with `// theme-exempt: <reason>`). Do not regenerate the baseline to hide them.\n",
    );
    process.exitCode = 1;
    return;
  }

  if (diff.shrunk.length > 0) {
    process.stdout.write(
      `colors:check ok. ${diff.shrunk.length} baseline file(s) improved: run \`pnpm colors:baseline\` to lock it in.\n`,
    );
  } else {
    process.stdout.write(
      "colors:check ok. No new or grown color violations.\n",
    );
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 2;
});
