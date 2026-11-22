"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { RuleTester } = require("eslint");

const {
  COLOR_ENFORCED_PACKAGES,
  LEGACY_COLOR_BASELINE,
  colorRuleOffOverrides,
  legacyColorOverrides,
} = require("../hard-coded-colors");
const {
  TAILWIND_DEFAULT_PALETTES,
  findNamedCssColor,
  findNamedTailwindColorClasses,
} = require("../named-colors");
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
      // Token-mapped Mantine scales, stock Mantine colors and keywords.
      `const view = <Text c="dark.9" bg="dark.7" color="teal" />;`,
      `const view = <Text c="var(--gn-text-muted)" bg="transparent" />;`,
      `const style = { color: "currentColor", background: "transparent", border: "inherit" };`,
      `const style = { whiteSpace: "nowrap", color: "var(--gn-white)" };`,
      // Other named colors are outside the guard.
      `const view = <Text c="red" />;`,
      // Repo token palettes are never mistaken for Tailwind default palettes.
      `const className = "bg-paper-2 text-subtle text-legacy-gray-100 text-on-brand border-panel-line bg-state-played-tint text-nav-text ring-focus bg-brand-tint from-brand-4 to-transparent via-paper-1/50 text-dimmed-2 divide-line";`,
      `const className = "text-muted accent-accent bg-surface-3/80 hover:bg-panel-raised md:text-body";`,
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
      // An exemption still works for named colors.
      `const view = <div style={{ background: "black" }} />; // theme-exempt: letterbox artwork`,
      // Test files are turned off by the consuming configs, not by the rule.
    ],

    invalid: [
      // Tailwind named colors and default palettes.
      ...[
        "bg-black",
        "text-white",
        "from-black",
        "via-black/50",
        "text-gray-400",
        "bg-zinc-900",
        "prose-invert",
        "lg:prose-invert",
        "prose-slate",
        "border-neutral-800",
        "ring-slate-700/40",
        "hover:text-white",
        "md:hover:bg-white/10",
        "dark:!text-red-500",
        "[&>svg]:text-white",
        "border-t-gray-200",
        "ring-offset-black",
        "fill-white",
        "divide-gray-800",
        "bg-black/[0.35]",
      ].map((className) => ({
        code: `const className = cn("flex p-2", "${className}");`,
        errors: [
          {
            messageId: "namedColorClass",
            data: { className },
            line: 1,
          },
        ],
      })),
      {
        code: "const className = `rounded ${open ? 'bg-black text-white' : ''}`;",
        errors: [
          { messageId: "namedColorClass", data: { className: "bg-black" } },
        ],
      },
      // Mantine props and style objects with fixed named colors.
      {
        code: `const view = <Text c="white" bg="black" color="WHITE" />;`,
        errors: [
          { messageId: "namedColor", data: { color: "white" } },
          { messageId: "namedColor", data: { color: "black" } },
          { messageId: "namedColor", data: { color: "white" } },
        ],
      },
      {
        code: `const view = <Box c={active ? "white" : "dark.9"} />;`,
        errors: [{ messageId: "namedColor", data: { color: "white" } }],
      },
      {
        code: `const view = <Box bd="1px solid black" />;`,
        errors: [{ messageId: "namedColor", data: { color: "black" } }],
      },
      {
        code: `const style = { color: "white", background: "linear-gradient(black, transparent)" };`,
        errors: [
          { messageId: "namedColor", data: { color: "white" } },
          { messageId: "namedColor", data: { color: "black" } },
        ],
      },
      {
        code: `const view = <div style={{ backgroundColor: "black" }} />;`,
        errors: [{ messageId: "namedColor", data: { color: "black" } }],
      },

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

test("named color helpers", () => {
  assert.deepEqual(
    findNamedTailwindColorClasses(
      "flex bg-black/60 text-paper-2 text-gray-400",
    ),
    ["bg-black/60", "text-gray-400"],
  );
  assert.deepEqual(
    findNamedTailwindColorClasses("prose prose-gamenode dark:prose-invert"),
    ["dark:prose-invert"],
  );
  assert.deepEqual(findNamedTailwindColorClasses("to-transparent text-white"), [
    "text-white",
  ]);
  assert.equal(findNamedCssColor("1px solid white"), "white");
  assert.equal(findNamedCssColor("var(--gn-white) transparent"), null);
  assert.equal(findNamedCssColor("url(black.png)"), null);
});

test("token palettes of the tailwind config never shadow a default palette", () => {
  const config = fs.readFileSync(
    path.join(REPO_ROOT, "packages/config-tailwind/tailwind.config.ts"),
    "utf8",
  );
  const start = config.indexOf("colors: {");
  assert.notEqual(start, -1, "tailwind.config.ts should define colors");

  // Walk the `colors: { ... }` block and collect its top-level keys.
  const keys = [];
  let depth = 0;
  let index = config.indexOf("{", start);
  let lineStart = index + 1;

  for (; index < config.length; index += 1) {
    const char = config[index];

    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
    if (char === "\n") lineStart = index + 1;

    if (depth === 1 && char === ":") {
      const key = config
        .slice(lineStart, index)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (/^[a-z][a-z0-9-]*$/i.test(key)) keys.push(key);
    }
  }

  assert.ok(keys.includes("paper") && keys.includes("brand"));

  for (const key of keys) {
    assert.ok(
      !TAILWIND_DEFAULT_PALETTES.includes(key) &&
        key !== "black" &&
        key !== "white",
      `tailwind.config.ts defines color '${key}', which collides with a Tailwind default palette`,
    );
    // And every token palette is accepted by the rule's detector.
    assert.deepEqual(
      findNamedTailwindColorClasses(`bg-${key}-5 text-${key}`),
      [],
    );
  }
});

test("default palette list matches tailwindcss/colors", (t) => {
  let colors;

  try {
    colors = require(
      require.resolve("tailwindcss/colors", {
        paths: [path.join(REPO_ROOT, "packages/config-tailwind")],
      }),
    );
  } catch {
    t.skip("tailwindcss is not installed");
    return;
  }

  const deprecated = new Set([
    "lightBlue",
    "warmGray",
    "trueGray",
    "coolGray",
    "blueGray",
  ]);
  const palettes = Object.keys(colors).filter(
    (name) =>
      !deprecated.has(name) &&
      !["inherit", "current", "transparent", "black", "white"].includes(name),
  );

  assert.deepEqual([...palettes].sort(), [...TAILWIND_DEFAULT_PALETTES].sort());
});

test("legacy baseline is valid and distributes per package", () => {
  for (const [file, count] of Object.entries(LEGACY_COLOR_BASELINE)) {
    assert.ok(
      !path.isAbsolute(file) && !file.includes("\\"),
      `${file} must be repo-relative with POSIX separators`,
    );
    assert.ok(
      Number.isInteger(count) && count > 0,
      `${file} needs a positive count`,
    );
    assert.ok(
      COLOR_ENFORCED_PACKAGES.some((pkg) => file.startsWith(`${pkg}/`)),
      `${file} is outside the enforced packages`,
    );
  }

  const baseline = {
    "packages/ui/src/a/B.tsx": 2,
    "packages/ui/src/a/b.css": 1,
    "packages/ui/src/a/[id].tsx": 1,
    "apps/web/src/c.tsx": 4,
  };
  const [uiOverride] = legacyColorOverrides("packages/ui", baseline);

  assert.deepEqual(uiOverride.files, ["src/a/B.tsx", "src/a/[[]id].tsx"]);
  assert.equal(uiOverride.rules["gamenode/no-hard-coded-colors"], "warn");
  assert.deepEqual(legacyColorOverrides("apps/mobile", baseline), []);

  const [offOverride] = colorRuleOffOverrides();
  assert.equal(offOverride.rules["gamenode/no-hard-coded-colors"], "off");
  assert.ok(offOverride.files.includes("**/*.test.tsx"));
  assert.ok(offOverride.files.includes("**/theme/themes/*.ts"));
  assert.ok(offOverride.files.includes("**/theme/generated/**"));
});
