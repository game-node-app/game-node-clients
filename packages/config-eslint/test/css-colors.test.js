"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const {
  getCssColorSeverity,
  matchesColorPattern,
} = require("../hard-coded-colors");
const { lintCssColors, lintCssSource } = require("../css-colors");

const CLI = path.resolve(__dirname, "../bin/lint-css-colors.js");

function createFixture(t, files) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "gn-css-colors-"));

  fs.writeFileSync(
    path.join(directory, "pnpm-workspace.yaml"),
    "packages:\n  - apps/*\n  - packages/*\n",
  );

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(directory, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  }

  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  return directory;
}

function colors(result) {
  return result.messages.map((message) => message.color).sort();
}

test("styles outside the legacy baseline are errors", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css":
      ".row { background: linear-gradient(#101010, rgb(0 0 0)); }",
    "packages/ui/src/theme/themes/xbox/screens/profile.module.css":
      ":root { --card: hsl(0 0% 4%); }",
    "apps/web/src/components/colors-new.module.css":
      ".card { border-color: #f15025; }",
  });

  const result = lintCssColors({ cwd: directory, roots: ["."], baseline: {} });

  assert.equal(result.errors, 4);
  assert.equal(result.warnings, 0);
  assert.ok(result.messages.every((message) => message.severity === "error"));
  assert.deepEqual(colors(result), [
    "#101010",
    "#f15025",
    "hsl(0 0% 4%)",
    "rgb(0 0 0)",
  ]);
});

test("baseline styles and admin are warnings", (t) => {
  const directory = createFixture(t, {
    "apps/web/src/components/legacy.css": ".legacy { color: #fff; }",
    "apps/admin/src/components/admin.css": ".admin { color: #fff; }",
  });

  const result = lintCssColors({
    cwd: directory,
    roots: ["."],
    baseline: { "apps/web/src/components/legacy.css": 1 },
  });

  assert.equal(result.errors, 0);
  assert.equal(result.warnings, 2);
  assert.ok(result.messages.every((message) => message.severity === "warn"));
});

test("fixed named colors are reported in color declarations and @apply", () => {
  const messages = lintCssSource({
    source: [
      ".a { color: white; }",
      ".b { background: linear-gradient(black, transparent); }",
      ".c { border: 1px solid BLACK; }",
      ".d { @apply bg-black/50 text-gray-400 hover:text-white; }",
      ".e { @apply bg-paper-2 text-muted border-line text-legacy-gray-100; }",
      ".f { color: transparent; background: currentColor; border-color: inherit; }",
      '.g { white-space: nowrap; font-family: Black Sans; content: "white"; }',
      ".h { color: var(--gn-white, white); background: url(white.png); }",
    ].join("\n"),
    severity: "error",
  });

  assert.deepEqual(
    messages.map((message) => [message.line, message.color]),
    [
      [1, "white"],
      [2, "black"],
      [3, "black"],
      [4, "bg-black/50"],
      [4, "text-gray-400"],
      [4, "hover:text-white"],
    ],
  );
});

test("tokens, var() and gradients built from tokens are accepted", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css": `
      :root {
        --row-bg: var(--gn-surface-1);
        --row-accent: var(--gn-brand);
      }

      .row {
        color: var(--gn-text);
        background: linear-gradient(90deg, var(--gn-brand), var(--gn-surface-2));
        border: 1px solid var(--gn-border);
        outline-color: rgb(var(--gn-focus-rgb));
        box-shadow: 0 0 0 2px hsl(var(--gn-focus-hsl));
        border-color: rgba(var(--gn-border-rgb), 0.5);
        text-shadow: 0 0 4px rgb(var(--gn-brand-rgb) / 40%);
      }

      .mix {
        background: color-mix(in srgb, var(--gn-brand) 20%, transparent);
      }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 0);
  assert.equal(result.warnings, 0);
  assert.deepEqual(result.messages, []);
});

test("color functions that keep literal channels are still reported", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css": `
      .row {
        background: rgba(0, 0, 0, var(--alpha));
      }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 1);
  assert.equal(result.messages[0].color, "rgba(0, 0, 0, var(--alpha))");
});

test("literal channels next to a var are still reported", () => {
  const messages = lintCssSource({
    source: ".a { color: rgb(255 0 0 / var(--alpha)); }",
    relFile: "packages/ui/src/theme/experiences/console/a.css",
    severity: "error",
  });

  assert.equal(messages.length, 1);
  assert.equal(messages[0].color, "rgb(255 0 0 / var(--alpha))");
});

test("selectors, fragment URLs and quoted text are ignored", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/art.module.css": `
      .bg-f15025, #fff-card { color: var(--gn-text); }

      .mask {
        mask-image: url(#fade);
        filter: url("#fade");
        background-image: url("data:image/svg+xml,<svg fill='%23fff'></svg>");
        background-color: url(#fff);
        content: "#F15025";
      }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.deepEqual(result.messages, []);
});

test("theme-exempt comments skip artwork with a reason", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/art.module.css": `
      /* theme-exempt: recap artwork gradient */
      .art {
        background: linear-gradient(#F15025, #5c0b06);
      }

      .art-overlay {
        /* theme-exempt: game art overlay */
        background: #000;
      }

      .chrome { color: #fff; } /* theme-exempt: platform brand mark */

      .other { color: #fff; }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 1);
  assert.equal(result.messages.length, 1);
  assert.equal(result.messages[0].color, "#fff");
  assert.match(result.messages[0].file, /art\.module\.css$/);
  assert.equal(result.messages[0].line, 14);
});

test("an exemption without a reason is reported and does not skip", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/art.module.css": `
      /* theme-exempt: */
      .art { background: #000; }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 2);
  assert.ok(
    result.messages.some((message) =>
      /needs an artwork reason/.test(message.message),
    ),
  );
  assert.ok(result.messages.some((message) => message.color === "#000"));
});

test("@apply and @value are checked", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css": `
      @value brand: #f15025;

      .row {
        @apply bg-[#fff] text-[rgb(0, 0, 0)];
      }

      .token {
        @apply text-[rgb(var(--gn-brand-rgb))] border-line;
      }
    `,
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 3);
  assert.ok(result.messages.some((message) => message.color === "#f15025"));
  assert.ok(
    result.messages.some(
      (message) =>
        message.color === "bg-[#fff]" && /Tailwind class/.test(message.message),
    ),
  );
  assert.ok(
    result.messages.some(
      (message) =>
        message.color === "text-[rgb(0, 0, 0)]" &&
        /Tailwind class/.test(message.message),
    ),
  );
});

test("generated themes.css is ignored", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/generated/themes.css":
      ":root { --gn-brand: #f15025; }",
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.files, 0);
  assert.deepEqual(result.messages, []);
});

test("literal positions point at the value line", () => {
  const messages = lintCssSource({
    source: [
      ".a {",
      "  background: linear-gradient(",
      "    #fff,",
      "    rgb(0 0 0)",
      "  );",
      "}",
    ].join("\n"),
    relFile: "packages/ui/src/theme/experiences/console/a.css",
    severity: "error",
  });

  assert.deepEqual(
    messages.map((message) => message.line),
    [3, 4],
  );
});

test("severity comes from the legacy baseline", () => {
  const baseline = { "apps/web/src/components/legacy.css": 3 };

  assert.equal(
    getCssColorSeverity("packages/ui/src/theme/experiences/console/row.css", {
      baseline,
    }),
    "error",
  );
  assert.equal(
    getCssColorSeverity("apps/web/src/components/legacy.css", { baseline }),
    "warn",
  );
  assert.equal(
    getCssColorSeverity("apps/web/src/components/new.css", { baseline }),
    "error",
  );
  assert.equal(
    getCssColorSeverity("apps/admin/src/components/new.css", { baseline }),
    "warn",
  );
  assert.equal(
    matchesColorPattern("packages/ui/src/theme/experiences/console/a.css", [
      "packages/ui/src/theme/experiences/**/*.css",
    ]),
    true,
  );
});

test("CLI fails on an error and passes with only legacy warnings", (t) => {
  const failing = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css":
      ".row { color: #fff; }",
  });

  const failed = spawnSync(process.execPath, [CLI, "."], {
    cwd: failing,
    encoding: "utf8",
  });

  assert.equal(failed.status, 1);
  assert.match(failed.stdout, /error/);
  assert.match(failed.stdout, /1 error\(s\), 0 warning\(s\)/);

  const warning = createFixture(t, {
    "apps/admin/src/components/legacy.css": ".legacy { color: #fff; }",
  });

  const warned = spawnSync(process.execPath, [CLI, "."], {
    cwd: warning,
    encoding: "utf8",
  });

  assert.equal(warned.status, 0);
  assert.match(warned.stdout, /warn/);
  assert.match(warned.stdout, /0 error\(s\), 1 warning\(s\)/);
});

test("solid filled backgrounds paired with body text tokens are errors", () => {
  const messages = lintCssSource({
    source: [
      ".brand { background: var(--gn-brand); color: var(--gn-text); }",
      ".danger { --button-bg: var(--gn-status-danger-strong); --button-color: var(--gn-text-muted); }",
      ".ok-fill { background: var(--gn-accent); color: var(--gn-accent-contrast); }",
      ".ok-tint { background: color-mix(in srgb, var(--gn-brand) 15%, transparent); color: var(--gn-text); }",
      ".ok-gradient { background: linear-gradient(var(--gn-brand), transparent); color: var(--gn-text); }",
      ".ok-surface { background: var(--gn-nav-raised); color: var(--gn-text); }",
      ".ok-bg-only { background: var(--gn-brand); }",
      ".ok-text-only { color: var(--gn-text); }",
      ".ok-sibling-bg { background: var(--gn-brand); }",
      ".ok-sibling-text { color: var(--gn-text); }",
      "/* theme-exempt: recap artwork eyebrow over brand art */",
      ".art { background: var(--gn-brand); color: var(--gn-text); }",
    ].join("\n"),
    severity: "error",
  });

  assert.deepEqual(
    messages.map((message) => [message.line, message.severity]),
    [
      [1, "error"],
      [2, "error"],
    ],
  );
  assert.match(
    messages[0].message,
    /Unsafe theme token pair: background 'background: var\(--gn-brand\)' with text 'color: var\(--gn-text\)'/,
  );
  assert.match(messages[0].message, /var\(--gn-brand-filled-text\)/);
  assert.match(
    messages[1].message,
    /background '--button-bg: var\(--gn-status-danger-strong\)' with text '--button-color: var\(--gn-text-muted\)'/,
  );
});

test("unsafe token pairs are errors even in legacy baseline files", (t) => {
  const directory = createFixture(t, {
    "apps/web/src/components/legacy.css":
      ".row { background: var(--gn-brand); color: var(--gn-text); }",
  });

  const result = lintCssColors({
    cwd: directory,
    roots: ["."],
    baseline: { "apps/web/src/components/legacy.css": 1 },
  });

  assert.equal(result.errors, 1);
  assert.equal(result.warnings, 0);
  assert.match(result.messages[0].message, /Unsafe theme token pair/);
});

test("selected ionic tabs must not take body text tokens", () => {
  const messages = lintCssSource({
    source: [
      "ion-tab-button.tab-selected::part(native) {",
      "  background: var(--gn-brand);",
      "}",
      "",
      "ion-tab-button.tab-selected {",
      "  --color-selected: var(--gn-text);",
      "  color: var(--gn-text);",
      "}",
      "",
      "ion-tab-button.tab-selected .fill {",
      "  --color-selected: var(--gn-brand-filled-text);",
      "}",
      "",
      "ion-tab-button.tab-selected .contrast {",
      "  --color-selected: var(--gn-accent-contrast);",
      "}",
      "",
      "ion-tab-button.tab-selected .text-color {",
      "  --color-selected: var(--gn-text-color);",
      "}",
      "",
      "ion-tab-button:not(.tab-selected) {",
      "  --color-selected: var(--gn-text);",
      "}",
    ].join("\n"),
    severity: "error",
  });

  assert.deepEqual(
    messages.map((message) => [message.line, message.severity]),
    [
      [6, "error"],
      [19, "error"],
    ],
  );
  assert.match(messages[0].message, /--color-selected: var\(--gn-text\)/);
  assert.match(
    messages[0].message,
    /var\(--gn-brand-filled-text\) or var\(--gn-accent-contrast\)/,
  );
});
