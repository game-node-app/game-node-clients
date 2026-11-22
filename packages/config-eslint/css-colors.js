"use strict";

/**
 * CSS counterpart of `rules/no-hard-coded-colors.js`.
 *
 * The repo lints JavaScript/TypeScript with ESLint, and the authored styles
 * (`.css`, CSS Modules) have no linter of their own. PostCSS is already a
 * dependency of every app (Tailwind), so this module parses each stylesheet and
 * reports color literals in declaration values and `@apply`/`@value` params.
 *
 * Covered:
 *  - hex, `rgb()`/`rgba()`/`hsl()`/`hsla()` and the other CSS color functions
 *    in declaration values, including gradients, box-shadows and custom
 *    properties (`--foo: #fff`);
 *  - Tailwind arbitrary color classes and arbitrary color properties in
 *    `@apply` (`bg-[#1a1a1a]`, `[color:rgb(…)]`).
 *
 * Not covered:
 *  - selectors (class names and ids may contain hex-like text);
 *  - `url(...)` targets and quoted strings (SVG fragment ids, data URIs and
 *    `content: "#fff"`), which are references or text, not paint;
 *  - generated styles (`packages/ui/src/theme/generated/**`), which are the
 *    generator's output.
 *
 * Exemptions: `/* theme-exempt: <reason> *\/` exempts its own line; when the
 * comment stands on its own line it also exempts the following rule/at-rule or
 * declaration and everything inside it. The reason is mandatory, and
 * exemptions are only for content artwork (game art, recap/awards artwork,
 * platform brand marks), same policy as the ESLint rule.
 *
 * Also covered: the CSS names `white`/`black` in color-bearing declarations
 * (`color: white`, `background: black`), and Tailwind default-palette/named
 * color utilities in `@apply` (`@apply bg-black text-gray-400`). `transparent`,
 * `currentColor` and `inherit` are fine.
 *
 * Also covered: unsafe theme token pairs. A solid filled accent/brand/status
 * surface (`background: var(--gn-brand)`, `--button-bg: var(--gn-accent)`, ...)
 * carries its own foreground; pairing it with a body/muted text token
 * (`color: var(--gn-text)`, `--color-selected: var(--gn-dimmed)`, ...) is
 * reported as an error even in legacy baseline files, because it is a light
 * theme contrast bug, not hard-coded color debt. Translucent fills
 * (`color-mix(...)`, `transparent`) are allowed. `--color-selected` on
 * `ion-tab-button.tab-selected` is reported even when the solid pill lives on
 * `::part(native)` in a sibling rule.
 *
 * Severity comes from `hard-coded-colors.js`: every style is `error` except
 * the files in the generated legacy baseline (`color-baseline.json`), which
 * stay `warn`. Unsafe token pairs are always `error`. `bin/lint-css-colors.js`
 * exits non-zero when any error is reported.
 */

const fs = require("node:fs");
const path = require("node:path");
const postcss = require("postcss");

const {
  LEGACY_COLOR_BASELINE,
  getCssColorSeverity,
  matchesColorPattern,
} = require("./hard-coded-colors");
const {
  COLOR_DECLARATION_PROPERTY,
  findNamedCssColor,
  findNamedTailwindColorClasses,
} = require("./named-colors");

const RULE_ID = "gamenode/no-hard-coded-colors";

// Semantic pair guard: a solid filled accent/brand/status surface has its own
// foreground token (`*-filled-text`). Body/muted text tokens are for page
// surfaces and become dark-on-dark (or light-on-light) in light themes.
const SOLID_FILLED_TOKEN =
  /var\(\s*--gn-(?:brand|brand-5|accent|tertiary|status-danger-strong|danger|state-played|premium)(?![\w-])/;

const BODY_TEXT_TOKEN =
  /var\(\s*--gn-(?:text|text-color|text-muted|dimmed|dimmed-1|dimmed-2|dimmed-3)(?![\w-])|var\(\s*--mantine-color-(?:text|dimmed)(?![\w-])/;

const TRANSLUCENT_FILL = /color-mix\(|transparent/i;

const UNSAFE_BACKGROUND_PROPERTIES = new Set([
  "background",
  "background-color",
  "--background",
  "--button-bg",
]);

const UNSAFE_TEXT_PROPERTIES = new Set([
  "color",
  "--color",
  "--color-selected",
  "--button-color",
]);

const IONIC_TAB_SELECTOR = /ion-tab-button\.tab-selected(?![\w-])/;

const UNSAFE_PAIR_MESSAGE =
  "Unsafe theme token pair: background '{{background}}' with text '{{text}}'. Body text tokens are meant for page surfaces; on a solid filled surface they become dark-on-dark (or light-on-light) in light themes such as Ruins. Use the matching filled-text token instead: var(--gn-brand-filled-text), var(--gn-danger-filled-text), var(--gn-state-played-filled-text) or var(--gn-accent-contrast).";

const SELECTED_TAB_MESSAGE =
  "Selected Ionic tab sets '{{text}}' while the selected pill is filled with a brand/accent token (often on ::part(native) in a sibling rule). Use the filled-text token for the selected label instead: var(--gn-brand-filled-text) or var(--gn-accent-contrast).";

const HEX_COLOR =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/g;

const FUNCTIONAL_COLOR_START =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/gi;

// Mirrors `rules/no-hard-coded-colors.js`; only used for `@apply` params.
const TAILWIND_ARBITRARY_COLOR =
  /(?:^|[\s"'`])(?:[a-z0-9-]+:)*(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|caret|accent|drop-shadow)-\[[^\]]*(?:#|\b(?:rgba?|hsla?)\s*\()[^\]]*\](?:\/(?:\d+|\[[^\]]*\])?)?/gi;

const TAILWIND_ARBITRARY_PROPERTY =
  /\[(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke|text-decoration-color|caret-color|accent-color)\s*:\s*(?:#|\b(?:rgba?|hsla?)\s*\()[^\]]*\]/gi;

const URL_TOKEN = /\burl\(\s*(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^)]*)\)/gi;
const QUOTED_STRING = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g;

const EXEMPT_COMMENT = /theme-exempt\s*:\s*(.*)$/;
const SCANNED_AT_RULES = new Set(["apply", "value"]);

const DEFAULT_IGNORE_PATTERNS = Object.freeze([
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/.turbo/**",
  "**/android/**",
  "**/ios/**",
  "**/www/**",
  "**/theme/generated/**",
  "**/*.min.css",
]);

const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".next",
  ".turbo",
  "android",
  "build",
  "coverage",
  "dist",
  "ios",
  "node_modules",
  "www",
]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function findRepoRoot(startDir) {
  let current = path.resolve(startDir);

  while (true) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startDir);
    current = parent;
  }
}

function collectCssFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  const stat = fs.statSync(directory);
  if (stat.isFile()) return directory.endsWith(".css") ? [directory] : [];

  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (IGNORED_DIRECTORIES.has(entry.name)) continue;

    const absolute = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectCssFiles(absolute));
    } else if (entry.isFile() && entry.name.endsWith(".css")) {
      files.push(absolute);
    }
  }

  return files;
}

function getMaskedRanges(value) {
  const ranges = [];

  for (const pattern of [URL_TOKEN, QUOTED_STRING]) {
    pattern.lastIndex = 0;

    let match = pattern.exec(value);
    while (match) {
      ranges.push([match.index, match.index + match[0].length]);
      match = pattern.exec(value);
    }
  }

  return ranges;
}

function isMasked(index, ranges) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

/**
 * Removes `var(...)` references (including nested fallbacks) so a color
 * function built only from tokens, such as `rgb(var(--gn-brand-rgb))`, is not
 * mistaken for a literal. A function that keeps numbers outside its vars is
 * still a literal.
 */
function stripVarFunctions(value) {
  let result = "";
  let index = 0;

  while (index < value.length) {
    const start = value.indexOf("var(", index);

    if (start === -1) {
      result += value.slice(index);
      break;
    }

    result += value.slice(index, start);

    let depth = 1;
    let cursor = start + "var(".length;

    while (cursor < value.length && depth > 0) {
      if (value[cursor] === "(") depth += 1;
      if (value[cursor] === ")") depth -= 1;
      cursor += 1;
    }

    index = cursor;
  }

  return result;
}

function isTokenizedColorFunction(match) {
  const body = match.slice(
    match.indexOf("(") + 1,
    match.endsWith(")") ? -1 : match.length,
  );
  if (!body.includes("var(")) return false;

  // Alpha may stay literal (`rgba(var(--gn-brand-rgb), 0.5)`); channel values
  // may not.
  const residue = stripVarFunctions(body)
    .replace(/\/\s*[\d.]+%?/g, "")
    .replace(/,\s*[\d.]+%?\s*$/, "");

  return !/[0-9#]/.test(residue);
}

/**
 * A value that is exactly one filled token (`var(--gn-brand)`, optional
 * `!important`) is a solid fill. Grain gradients and multi-layer backgrounds
 * built from the token are not a single solid surface, so they are not paired.
 */
function isSolidFilledValue(value) {
  if (!SOLID_FILLED_TOKEN.test(value)) return false;
  if (TRANSLUCENT_FILL.test(value)) return false;

  return (
    stripVarFunctions(value)
      .replace(/!important\s*$/i, "")
      .trim() === ""
  );
}

/**
 * Finds color functions with balanced parentheses, so nested `var()`/`calc()`
 * arguments are kept whole (`rgba(0, 0, 0, var(--alpha))`).
 */
function collectFunctionalColors(value) {
  const literals = [];
  FUNCTIONAL_COLOR_START.lastIndex = 0;

  let match = FUNCTIONAL_COLOR_START.exec(value);
  while (match) {
    let depth = 1;
    let cursor = match.index + match[0].length;

    while (cursor < value.length && depth > 0) {
      if (value[cursor] === "(") depth += 1;
      if (value[cursor] === ")") depth -= 1;
      cursor += 1;
    }

    literals.push({
      index: match.index,
      literal: value.slice(match.index, cursor),
    });
    FUNCTIONAL_COLOR_START.lastIndex = cursor;
    match = FUNCTIONAL_COLOR_START.exec(value);
  }

  return literals;
}

function collectColorLiterals(value) {
  const masked = getMaskedRanges(value);
  const literals = [];

  HEX_COLOR.lastIndex = 0;

  let match = HEX_COLOR.exec(value);
  while (match) {
    if (!isMasked(match.index, masked)) {
      literals.push({ index: match.index, literal: match[0] });
    }

    match = HEX_COLOR.exec(value);
  }

  for (const { index, literal } of collectFunctionalColors(value)) {
    if (isTokenizedColorFunction(literal)) continue;
    if (isMasked(index, masked)) continue;

    literals.push({ index, literal });
  }

  return literals.sort((a, b) => a.index - b.index);
}

function positionAt(source, offset) {
  const before = source.slice(0, offset);
  const lines = before.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

function collectTailwindLiterals(value) {
  const literals = [];

  for (const pattern of [
    TAILWIND_ARBITRARY_COLOR,
    TAILWIND_ARBITRARY_PROPERTY,
  ]) {
    pattern.lastIndex = 0;

    let match = pattern.exec(value);
    while (match) {
      const trimmed = match[0].trim();
      const open = trimmed.indexOf("[");
      const close = trimmed.lastIndexOf("]");
      const bracket =
        open === -1 || close === -1 ? "" : trimmed.slice(open + 1, close);

      // `text-[rgb(var(--gn-brand-rgb))]` is an arbitrary class but still a
      // token reference; only report classes that keep a literal.
      if (bracket && collectColorLiterals(bracket).length === 0) {
        match = pattern.exec(value);
        continue;
      }

      const leading = match[0].length - match[0].trimStart().length;
      literals.push({ index: match.index + leading, literal: trimmed });
      match = pattern.exec(value);
    }
  }

  return literals.sort((a, b) => a.index - b.index);
}

function getLineText(source, line) {
  const lines = source.split("\n");
  return lines[line - 1] ?? "";
}

function isStandaloneComment(source, comment) {
  const line = getLineText(source, comment.source.start.line);
  const before = line.slice(0, comment.source.start.column - 1).trim();

  return before === "" || before === "{";
}

function lineRange(start, end) {
  const lines = [];

  for (let line = start; line <= end; line += 1) lines.push(line);

  return lines;
}

/**
 * Lints one stylesheet. Exposed for tests; `lintCssColors` is the normal entry.
 */
function lintCssSource({
  source,
  file = "<css>",
  relFile = file,
  severity = "warn",
}) {
  const messages = [];
  let root;

  try {
    root = postcss.parse(source, { from: file });
  } catch (error) {
    messages.push({
      file: relFile,
      line: error.line ?? 1,
      column: error.column ?? 1,
      severity: "error",
      ruleId: RULE_ID,
      message: `Could not parse CSS: ${error.reason ?? error.message}`,
    });

    return messages;
  }

  const allNodes = [];
  const exemptions = [];
  const exemptLines = new Set();

  root.walk((node) => {
    if (node.type !== "comment") allNodes.push(node);
  });

  root.walkComments((comment) => {
    const match = EXEMPT_COMMENT.exec(comment.text);
    if (!match) return;

    const reason = match[1].replace(/\*\/\s*$/, "").trim();

    if (!reason) {
      messages.push({
        file: relFile,
        line: comment.source.start.line,
        column: comment.source.start.column,
        severity,
        ruleId: RULE_ID,
        message:
          "A theme exemption needs an artwork reason: /* theme-exempt: <reason> */.",
      });
      return;
    }

    exemptions.push(comment);
  });

  for (const comment of exemptions) {
    for (const line of lineRange(
      comment.source.start.line,
      comment.source.end.line,
    )) {
      exemptLines.add(line);
    }

    if (!isStandaloneComment(source, comment)) continue;

    const nextNode = allNodes
      .filter((node) => node.source?.start.offset >= comment.source.end.offset)
      .sort(
        (a, b) =>
          a.source.start.offset - b.source.start.offset ||
          b.source.end.offset - a.source.end.offset,
      )[0];

    if (!nextNode) continue;

    for (const line of lineRange(
      nextNode.source.start.line,
      nextNode.source.end.line,
    )) {
      exemptLines.add(line);
    }
  }

  function pushColor(literal, offset, messageId) {
    const position = positionAt(source, offset);
    if (exemptLines.has(position.line)) return;

    messages.push({
      file: relFile,
      line: position.line,
      column: position.column,
      severity,
      ruleId: RULE_ID,
      color: literal,
      message:
        messageId === "class"
          ? `Hard-coded color in Tailwind class '${literal}'. Use a token utility (for example bg-paper-2, text-brand-5 or border-line) instead.`
          : messageId === "namedClass"
            ? `Tailwind class '${literal}' uses a fixed color that ignores the theme (it breaks in light themes). Use a token utility (bg-paper-2, text-muted, border-line, text-on-brand) or, over imagery, the --gn-media-* pair.`
            : messageId === "named"
              ? `Fixed color '${literal}' ignores the theme (it breaks in light themes). Use a theme token (var(--gn-text), var(--gn-surface-2)) or, over imagery, var(--gn-media-text)/var(--gn-media-scrim).`
              : `Hard-coded color '${literal}' is not themeable. Use a theme token instead (for example var(--gn-brand) or var(--gn-surface-2)).`,
    });
  }

  root.walkDecls((decl) => {
    const valueOffset =
      decl.source.start.offset +
      decl.prop.length +
      (decl.raws.between ?? "").length;

    for (const { index, literal } of collectColorLiterals(decl.value)) {
      pushColor(literal, valueOffset + index, "color");
    }

    if (COLOR_DECLARATION_PROPERTY.test(decl.prop)) {
      const named = findNamedCssColor(decl.value);

      if (named) {
        const index = decl.value.toLowerCase().indexOf(named);
        pushColor(named, valueOffset + Math.max(index, 0), "named");
      }
    }
  });

  function formatMessage(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? "");
  }

  /**
   * Reports at the text declaration: the background is usually intentional, the
   * label color is what must switch to the `*-filled-text` token.
   */
  function pushUnsafePair(text, template, data) {
    if (exemptLines.has(text.source.start.line)) return;

    messages.push({
      file: relFile,
      line: text.source.start.line,
      column: text.source.start.column,
      severity: "error",
      ruleId: RULE_ID,
      message: formatMessage(template, data),
    });
  }

  root.walkRules((rule) => {
    const declarations = (rule.nodes ?? []).filter(
      (node) => node.type === "decl",
    );

    const background = declarations.find(
      (decl) =>
        UNSAFE_BACKGROUND_PROPERTIES.has(decl.prop.toLowerCase()) &&
        isSolidFilledValue(decl.value),
    );
    const text = declarations.find(
      (decl) =>
        UNSAFE_TEXT_PROPERTIES.has(decl.prop.toLowerCase()) &&
        BODY_TEXT_TOKEN.test(decl.value),
    );

    if (background && text) {
      pushUnsafePair(text, UNSAFE_PAIR_MESSAGE, {
        background: `${background.prop}: ${background.value}`,
        text: `${text.prop}: ${text.value}`,
      });
    }

    if (!IONIC_TAB_SELECTOR.test(rule.selector)) {
      return;
    }

    // Ionic draws the selected pill on `::part(native)` in a sibling rule, so
    // the block itself has no background; `--color-selected` still lands on the
    // brand/accent fill and must not be a body text token.
    for (const decl of declarations) {
      if (decl.prop.toLowerCase() !== "--color-selected") continue;
      if (!BODY_TEXT_TOKEN.test(decl.value)) continue;
      if (background && decl === text) continue;

      pushUnsafePair(decl, SELECTED_TAB_MESSAGE, {
        text: `${decl.prop}: ${decl.value}`,
      });
    }
  });

  root.walkAtRules((atRule) => {
    if (!SCANNED_AT_RULES.has(atRule.name.toLowerCase())) return;

    const paramsOffset =
      atRule.source.start.offset + atRule.toString().indexOf(atRule.params);
    const classLiterals = collectTailwindLiterals(atRule.params);
    const classRanges = classLiterals.map(({ index, literal }) => [
      index,
      index + literal.length,
    ]);

    for (const { index, literal } of classLiterals) {
      pushColor(literal, paramsOffset + index, "class");
    }

    // An arbitrary color class already explains the literal; don't report the
    // same bytes twice as a plain CSS color.
    for (const { index, literal } of collectColorLiterals(atRule.params)) {
      const covered = classRanges.some(
        ([start, end]) => index >= start && index < end,
      );
      if (!covered) pushColor(literal, paramsOffset + index, "color");
    }

    if (atRule.name.toLowerCase() === "apply") {
      for (const className of findNamedTailwindColorClasses(atRule.params)) {
        pushColor(
          className,
          paramsOffset + Math.max(atRule.params.indexOf(className), 0),
          "namedClass",
        );
      }
    }
  });

  return messages.sort(
    (a, b) =>
      a.line - b.line ||
      a.column - b.column ||
      a.message.localeCompare(b.message),
  );
}

/**
 * Lints every `.css` file under `roots` (relative to `cwd`) and returns the
 * messages plus counters. Files are resolved against the nearest monorepo root
 * so the severity list works when the CLI runs from a package directory.
 */
function lintCssColors({
  cwd = process.cwd(),
  roots = ["src"],
  baseline = LEGACY_COLOR_BASELINE,
  ignorePatterns = DEFAULT_IGNORE_PATTERNS,
  repoRoot = findRepoRoot(cwd),
} = {}) {
  const files = new Set();

  for (const root of roots) {
    for (const file of collectCssFiles(path.resolve(cwd, root))) {
      files.add(file);
    }
  }

  const messages = [];
  let checkedFiles = 0;

  for (const file of [...files].sort()) {
    const relFile = toPosix(path.relative(repoRoot, file));

    if (matchesColorPattern(relFile, ignorePatterns)) continue;

    checkedFiles += 1;

    const severity = getCssColorSeverity(relFile, { baseline });

    messages.push(
      ...lintCssSource({
        source: fs.readFileSync(file, "utf8"),
        file,
        relFile,
        severity,
      }),
    );
  }

  const errors = messages.filter((message) => message.severity === "error");
  const warnings = messages.filter((message) => message.severity === "warn");

  return {
    messages,
    files: checkedFiles,
    errors: errors.length,
    warnings: warnings.length,
  };
}

module.exports = {
  DEFAULT_IGNORE_PATTERNS,
  collectColorLiterals,
  findRepoRoot,
  lintCssColors,
  lintCssSource,
};
