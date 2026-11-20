"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { RuleTester } = require("eslint");

const {
  MIGRATED_COLOR_FILES,
  colorRuleOffOverrides,
  migratedColorOverrides,
} = require("../hard-coded-colors");
const rule = require("../rules/no-hard-coded-colors");

const REPO_ROOT = path.resolve(__dirname, "../../..");

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

test("gamenode/no-hard-coded-colors", () => {
  ruleTester.run("no-hard-coded-colors", rule, {
    valid: [
      // Tokens are the supported way to write colors.
      `const color = "var(--gn-brand)";`,
      `const className = "bg-paper-2 text-brand-5 border-line";`,
      `const view = <Text c="var(--gn-text-muted)" className="bg-paper-1" />;`,
      `const vars = { "--button-bg": "var(--gn-brand)" };`,
      `const className = "bg-[var(--gn-surface-2)]";`,
      // Named CSS colors are outside the hex/rgb()/hsl() guard.
      `const view = <Text c="white" />;`,
      // A hash fragment inside a larger string is not a color.
      `const url = "https://example.com/docs#fff";`,
      `const id = "section-#f15025";`,
      `const prose = "Use #fff for artwork only.";`,
      // Reference attributes are not paint, even when the value is hex-shaped.
      `const link = <a href="#fade">Docs</a>;`,
      `const image = <img src="#fff" />;`,
      `const meta = <div data-color="#fff" aria-label="#000" />;`,
      // Artwork exemption above a JSX element (own line, JSX comment).
      `
        const view = (
          <>
            {/* theme-exempt: game cover artwork */}
            <Image style={{ background: "#000" }} />
          </>
        );
      `,
      // Artwork exemption on the same line as the literal.
      `const view = <Image style={{ background: "#000" }} />; // theme-exempt: game artwork`,
      // Artwork exemption above a whole object.
      `
        // theme-exempt: recap artwork palette
        const palette = {
          background: "#101010",
          accent: "rgb(255, 0, 0)",
        };
      `,
      // Artwork exemption inside a style object, above the property.
      `
        const style = {
          color: "var(--gn-text)",
          // theme-exempt: platform brand mark
          background: "linear-gradient(#fff, #000)",
        };
      `,
      // Test files are turned off by the consuming configs, not by the rule.
    ],

    invalid: [
      {
        code: `const view = <Text c="#F15025" />;`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#F15025" },
            line: 1,
          },
        ],
      },
      {
        code: `const className = "flex bg-[#1a1a1a]";`,
        errors: [
          {
            messageId: "hardCodedColorClass",
            data: { className: "bg-[#1a1a1a]" },
            line: 1,
          },
        ],
      },
      {
        code: "const view = <Box className={`p-2 hover:bg-[#fff]/50`} />;",
        errors: [
          {
            messageId: "hardCodedColorClass",
            data: { className: "hover:bg-[#fff]/50" },
            line: 1,
          },
        ],
      },
      {
        code: `const className = "[color:#fff] p-2";`,
        errors: [
          {
            messageId: "hardCodedColorClass",
            data: { className: "[color:#fff]" },
            line: 1,
          },
        ],
      },
      {
        code: `const style = { color: "rgb(1, 2, 3)" };`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "rgb(1, 2, 3)" },
            line: 1,
          },
        ],
      },
      {
        code: `const view = <Box style={{ background: "hsl(0 0% 0%)" }} />;`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "hsl(0 0% 0%)" },
            line: 1,
          },
        ],
      },
      {
        code: `const view = <Box style={{ border: "1px solid #2a2a2a" }} />;`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#2a2a2a" },
            line: 1,
          },
        ],
      },
      {
        code: `const style = { boxShadow: "0 0 0 2px rgba(0, 0, 0, 0.4)" };`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "rgba(0, 0, 0, 0.4)" },
            line: 1,
          },
        ],
      },
      {
        code: `const BRAND = "#f15025";`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#f15025" },
            line: 1,
          },
        ],
      },
      {
        code: `const vars = { "--button-bg": "#f15025" };`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#f15025" },
            line: 1,
          },
        ],
      },
      {
        // The escape hatch requires a reason.
        code: `// theme-exempt:\nconst BRAND = "#f15025";`,
        errors: [
          { messageId: "exemptionNeedsReason", line: 1 },
          {
            messageId: "hardCodedColor",
            data: { color: "#f15025" },
            line: 2,
          },
        ],
      },
      {
        // The exemption covers its element only, not later siblings.
        code: `
          const view = (
            <>
              {/* theme-exempt: game cover artwork */}
              <Image style={{ background: "#000" }} />
              <Text c="#fff" />
            </>
          );
        `,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#fff" },
            line: 6,
          },
        ],
      },
      {
        // A trailing exemption covers its own line, not the next one.
        code: `const art = "#000"; // theme-exempt: game artwork\nconst chrome = "#fff";`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#fff" },
            line: 2,
          },
        ],
      },
      {
        // rgb() in a plain JSX attribute.
        code: `const view = <Box background="rgba(241, 80, 37, 0.1)" />;`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "rgba(241, 80, 37, 0.1)" },
            line: 1,
          },
        ],
      },
      {
        // SVG paint attributes are colors and stay covered.
        code: `const view = <path fill="#fff" stroke="rgb(0, 0, 0)" />;`,
        errors: [
          {
            messageId: "hardCodedColor",
            data: { color: "#fff" },
            line: 1,
          },
          {
            messageId: "hardCodedColor",
            data: { color: "rgb(0, 0, 0)" },
            line: 1,
          },
        ],
      },
    ],
  });

  assert.ok(rule.meta.messages);
});

test("migrated color file list is valid and distributes per package", () => {
  assert.ok(
    MIGRATED_COLOR_FILES.length > 0,
    "the error list starts with the files this change touches",
  );

  for (const file of MIGRATED_COLOR_FILES) {
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, file)),
      `${file} is listed but does not exist`,
    );
    assert.ok(
      !path.isAbsolute(file) && !file.includes("\\"),
      `${file} must be repo-relative with POSIX separators`,
    );
  }

  // CSS entries are read by the CSS checker, not by ESLint `overrides`.
  const uiFiles = MIGRATED_COLOR_FILES.filter(
    (file) =>
      file.startsWith("packages/ui/") && /\.(?:[cm]?[jt]sx?)$/.test(file),
  );
  const [uiOverride] = migratedColorOverrides("packages/ui");

  assert.deepEqual(
    uiOverride.files,
    uiFiles.map((file) => file.slice("packages/ui/".length)),
  );
  assert.equal(uiOverride.rules["gamenode/no-hard-coded-colors"], "error");

  const [offOverride] = colorRuleOffOverrides();
  assert.equal(offOverride.rules["gamenode/no-hard-coded-colors"], "off");
  assert.ok(offOverride.files.includes("**/*.test.tsx"));
});
