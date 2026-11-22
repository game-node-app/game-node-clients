"use strict";

/**
 * Rollout of `gamenode/no-hard-coded-colors`.
 *
 * The rule is `error` by default in `packages/ui`, `apps/web` and
 * `apps/mobile` (TS/TSX and CSS), so NEW code cannot add a color that bypasses
 * the theme (hex/rgb literals, fixed Tailwind palettes such as `bg-black` or
 * `text-gray-400`, `c="white"`, `color: white`, ...).
 *
 * Code that already violated the rule when the default was flipped lives in a
 * generated LEGACY BASELINE (`color-baseline.json`, repo-relative path ->
 * number of violations). Those files stay `warn`, and `colors:check` fails if
 * a baseline file gets MORE violations or a file outside the baseline gets any.
 * Shrinking is always allowed; regenerate the baseline to lock progress in:
 *
 *   pnpm colors:baseline   # rewrite color-baseline.json from the current code
 *   pnpm colors:check      # CI/lint: no new violations, no growth
 *
 * Never edit `color-baseline.json` by hand. `apps/admin` is pinned to the
 * `gamenode` theme and stays a warning (no baseline).
 *
 * The consuming ESLint configs call `legacyColorOverrides("<package root>")`
 * and only pick up entries under their own root, because eslintrc `overrides`
 * patterns are relative to the config file. The CSS checker reads the whole
 * baseline and matches against the repo root.
 */

const fs = require("node:fs");
const path = require("node:path");

const BASELINE_FILE = path.join(__dirname, "color-baseline.json");

/** Packages where the rule is an error by default and the baseline applies. */
const COLOR_ENFORCED_PACKAGES = Object.freeze([
  "packages/ui",
  "apps/web",
  "apps/mobile",
]);

/** Packages that only warn (admin is pinned to the gamenode theme). */
const COLOR_WARN_ONLY_PATTERNS = Object.freeze(["apps/admin/**"]);

/**
 * Tests assert colors on purpose (contrast checks, class expectations), and
 * theme definitions are the one legitimate place for literals (the theme
 * definitions are the token source; generated files come from the generator).
 */
const COLOR_RULE_OFF_PATTERNS = Object.freeze([
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/__tests__/**/*.ts",
  "**/__tests__/**/*.tsx",
  "**/theme/themes/*.ts",
  "**/theme/generated/**",
]);

const ESLINT_SOURCE_FILE = /\.(?:[cm]?[jt]sx?)$/;

function loadColorBaseline(file = BASELINE_FILE) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Object.freeze({ ...(parsed.files ?? {}) });
  } catch (error) {
    if (error && error.code === "ENOENT") return Object.freeze({});
    throw error;
  }
}

const LEGACY_COLOR_BASELINE = loadColorBaseline();

function normalizeRoot(packageRoot) {
  return packageRoot.replace(/^\/+|\/+$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.+^${}()|[\]\\]/g, "\\$&");
}

/**
 * Minimal glob matcher for the checked-in patterns (`*`, `**` and `?`). A
 * pattern is matched against the repo-relative POSIX path.
 */
function matchesColorPattern(file, patterns) {
  return patterns.some((pattern) => {
    let source = "^";

    for (let index = 0; index < pattern.length; index += 1) {
      const char = pattern[index];

      if (char === "*") {
        if (pattern[index + 1] === "*") {
          index += 1;

          if (pattern[index + 1] === "/") {
            index += 1;
            source += "(?:.*/)?";
          } else {
            source += ".*";
          }
        } else {
          source += "[^/]*";
        }
      } else if (char === "?") {
        source += "[^/]";
      } else {
        source += escapeRegExp(char);
      }
    }

    return new RegExp(`${source}$`).test(file);
  });
}

/**
 * CSS severity: `error` for every file except the legacy baseline and the
 * warn-only packages (admin), which stay `warn`.
 */
function getCssColorSeverity(file, options = {}) {
  const baseline = options.baseline ?? LEGACY_COLOR_BASELINE;
  const warnOnlyPatterns = options.warnOnlyPatterns ?? COLOR_WARN_ONLY_PATTERNS;

  if (Object.prototype.hasOwnProperty.call(baseline, file)) return "warn";
  if (matchesColorPattern(file, warnOnlyPatterns)) return "warn";

  return "error";
}

/**
 * Returns eslintrc `overrides` entries that keep the legacy baseline files
 * under `packageRoot` (repo-relative, e.g. "apps/web") at `warn`. Patterns are
 * made relative to the consuming config, as eslintrc requires.
 */
function legacyColorOverrides(packageRoot, baseline = LEGACY_COLOR_BASELINE) {
  const prefix = `${normalizeRoot(packageRoot)}/`;
  const files = Object.keys(baseline)
    .filter((file) => file.startsWith(prefix) && ESLINT_SOURCE_FILE.test(file))
    .sort()
    .map((file) => file.slice(prefix.length).replace(/\[/g, "[[]"));

  if (files.length === 0) return [];

  return [
    {
      files,
      rules: {
        "gamenode/no-hard-coded-colors": "warn",
      },
    },
  ];
}

function colorRuleOffOverrides() {
  return [
    {
      files: [...COLOR_RULE_OFF_PATTERNS],
      rules: {
        "gamenode/no-hard-coded-colors": "off",
      },
    },
  ];
}

module.exports = {
  BASELINE_FILE,
  COLOR_ENFORCED_PACKAGES,
  COLOR_RULE_OFF_PATTERNS,
  COLOR_WARN_ONLY_PATTERNS,
  LEGACY_COLOR_BASELINE,
  colorRuleOffOverrides,
  getCssColorSeverity,
  legacyColorOverrides,
  loadColorBaseline,
  matchesColorPattern,
};
