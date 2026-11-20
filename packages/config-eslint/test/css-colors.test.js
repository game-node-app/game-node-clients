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

test("new packs and migrated styles are errors", (t) => {
  const directory = createFixture(t, {
    "packages/ui/src/theme/experiences/console/row.module.css":
      ".row { background: linear-gradient(#101010, rgb(0 0 0)); }",
    "packages/ui/src/theme/themes/xbox/screens/profile.module.css":
      ":root { --card: hsl(0 0% 4%); }",
    "apps/web/src/components/colors-migrated.module.css":
      ".card { border-color: #f15025; }",
  });

  const result = lintCssColors({
    cwd: directory,
    roots: ["."],
    migratedFiles: ["apps/web/src/components/colors-migrated.module.css"],
  });

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

test("legacy styles are warnings", (t) => {
  const directory = createFixture(t, {
    "apps/web/src/components/legacy.css": ".legacy { color: #fff; }",
  });

  const result = lintCssColors({ cwd: directory, roots: ["."] });

  assert.equal(result.errors, 0);
  assert.equal(result.warnings, 1);
  assert.equal(result.messages[0].severity, "warn");
  assert.equal(result.messages[0].color, "#fff");
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

test("severity comes from the central migrated list and the new pack patterns", () => {
  assert.equal(
    getCssColorSeverity(
      "packages/ui/src/theme/experiences/console/row.module.css",
    ),
    "error",
  );
  assert.equal(
    getCssColorSeverity(
      "packages/ui/src/theme/themes/xbox/screens/profile.module.css",
    ),
    "error",
  );
  assert.equal(
    getCssColorSeverity("apps/web/src/components/legacy.css"),
    "warn",
  );
  assert.equal(
    getCssColorSeverity("apps/mobile/src/components/migrated.css", {
      migratedFiles: ["apps/mobile/src/components/migrated.css"],
    }),
    "error",
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
    "apps/web/src/components/legacy.css": ".legacy { color: #fff; }",
  });

  const warned = spawnSync(process.execPath, [CLI, "."], {
    cwd: warning,
    encoding: "utf8",
  });

  assert.equal(warned.status, 0);
  assert.match(warned.stdout, /warn/);
  assert.match(warned.stdout, /0 error\(s\), 1 warning\(s\)/);
});
