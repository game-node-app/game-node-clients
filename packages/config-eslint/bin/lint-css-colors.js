#!/usr/bin/env node
"use strict";

/**
 * `pnpm lint` entry point for the CSS color guard.
 *
 * Usage (from a package directory):
 *   node ../../packages/config-eslint/bin/lint-css-colors.js src
 *
 * Files are matched against `hard-coded-colors.js`: migrated styles and new
 * experience/theme packs are errors, legacy styles are warnings. Exits 1 when
 * any error is reported (warnings never fail the run).
 */

const { lintCssColors } = require("../css-colors");

const roots = process.argv.slice(2).filter((arg) => !arg.startsWith("-"));

const result = lintCssColors({
  cwd: process.cwd(),
  roots: roots.length > 0 ? roots : ["src"],
});

for (const message of result.messages) {
  process.stdout.write(
    `${message.file}:${message.line}:${message.column}  ${message.severity}  ${message.message}  (${message.ruleId})\n`,
  );
}

if (result.errors > 0 || result.warnings > 0) {
  process.stdout.write(
    `\n${result.errors} error(s), ${result.warnings} warning(s) in ${result.files} CSS file(s).\n`,
  );
}

process.exitCode = result.errors > 0 ? 1 : 0;
