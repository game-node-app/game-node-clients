"use strict";

const test = require("node:test");
const { RuleTester } = require("eslint");

const rule = require("../rules/no-unsafe-theme-pairs");

const ruleTester = new RuleTester({
  parser: require.resolve("@typescript-eslint/parser"),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

/** One class-list case with both utilities in the same string. */
function classPair(background, text) {
  return {
    code: `const className = "flex items-center ${background} ${text}";`,
    errors: [
      {
        messageId: "unsafeThemePairClass",
        data: { background, text },
        line: 1,
      },
    ],
  };
}

/** One style-object case with both tokens in the same object. */
function stylePair(
  backgroundKey,
  background,
  textKey,
  text,
  code = `const vars = { "${backgroundKey}": "${background}", "${textKey}": "${text}" };`,
) {
  return {
    code,
    errors: [
      {
        messageId: "unsafeThemePairStyle",
        data: { backgroundKey, background, textKey, text },
        line: 1,
      },
    ],
  };
}

test("gamenode/no-unsafe-theme-pairs", () => {
  ruleTester.run("no-unsafe-theme-pairs", rule, {
    valid: [
      // Translucent tints keep the page surface behind the fill, so body text
      // stays readable.
      `const className = "bg-brand/15 text-foreground";`,
      `const className = "bg-brand/20 text-muted";`,
      `const className = "bg-premium/15 text-dimmed-2";`,
      `const className = "bg-state-played/10 text-subtle";`,
      `const className = "hover:bg-brand/25 hover:text-foreground";`,
      // The filled foreground tokens are the supported pairing.
      `const className = "bg-brand text-on-brand";`,
      `const className = "bg-brand text-on-brand-alt";`,
      `const className = "bg-accent text-accent-contrast";`,
      `const className = "bg-brand text-[var(--gn-brand-filled-text)]";`,
      `const className = "bg-status-danger-strong text-[var(--gn-danger-filled-text)]";`,
      `const className = "bg-state-played text-[var(--gn-state-played-filled-text)]";`,
      // Surface backgrounds are fine with body text.
      `const className = "bg-paper-2 text-foreground";`,
      `const className = "bg-surface-3 text-muted";`,
      `const className = "bg-nav-raised text-foreground";`,
      `const className = "bg-brand-tint text-foreground";`,
      `const className = "bg-state-played-tint text-subtle";`,
      `const className = "bg-panel text-dimmed";`,
      `const className = "text-muted";`,
      // Different variant prefixes paint different states, so they are not a
      // pair (the hover state must pair with a hover text class).
      `const className = "bg-brand hover:text-muted";`,
      `const className = "hover:bg-brand text-muted";`,
      `const className = "md:bg-accent text-foreground";`,
      `const className = "data-[active]:bg-brand text-foreground";`,
      `const className = "hover:bg-brand hover:text-on-brand";`,
      `const className = "md:hover:bg-accent md:hover:text-accent-contrast";`,
      // Style objects with the filled foreground token or a surface fill.
      `const vars = { "--button-bg": "var(--gn-brand)", "--button-color": "var(--gn-brand-filled-text)" };`,
      `const vars = { "--button-bg": "var(--gn-accent)", "--button-color": "var(--gn-accent-contrast)" };`,
      `const vars = { "--button-bg": "var(--gn-status-danger-strong)", "--button-color": "var(--gn-danger-filled-text)" };`,
      `const vars = { "--button-bg": "var(--gn-nav-raised)", "--button-color": "var(--gn-text)" };`,
      `const vars = { "--button-bg": "transparent", "--button-color": "var(--gn-text)" };`,
      `const vars = { "--button-bg": "var(--gn-brand-tint)", "--button-color": "var(--gn-text)" };`,
      `const vars = { background: "var(--gn-surface-2)", color: "var(--gn-text)" };`,
      `const vars = { background: "color-mix(in srgb, var(--gn-brand) 15%, transparent)", color: "var(--gn-text)" };`,
      `const vars = { background: "color-mix(in srgb, var(--gn-status-danger-strong) 10%, transparent)", color: "var(--gn-text)" };`,
      `const vars = { background: "linear-gradient(var(--gn-brand), transparent)", color: "var(--gn-text)" };`,
      // A gradient built from the token is not a single solid surface.
      `const vars = { background: "linear-gradient(var(--gn-brand), var(--gn-accent))", color: "var(--gn-text)" };`,
      // Dynamic values are not statically knowable.
      `const vars = { "--button-bg": brand, "--button-color": "var(--gn-text)" };`,
      `const vars = { background: theme.bg, color: "var(--gn-text)" };`,
      // An artwork exemption on the object / element / same line.
      `
        // theme-exempt: platform brand mark inside artwork
        const vars = {
          "--button-bg": "var(--gn-brand)",
          "--button-color": "var(--gn-text)",
        };
      `,
      `const vars = { "--button-bg": "var(--gn-brand)", "--button-color": "var(--gn-text)" }; // theme-exempt: recap artwork`,
      `
        const view = (
          <>
            {/* theme-exempt: game cover artwork */}
            <div className="bg-brand text-foreground" />
          </>
        );
      `,
      // Test files and theme definitions are turned off by the consuming
      // configs (colorRuleOffOverrides), not by the rule.
    ],

    invalid: [
      // Solid filled brand/accent/status backgrounds with body text.
      classPair("bg-brand", "text-foreground"),
      classPair("bg-brand", "text-body"),
      classPair("bg-brand-5", "text-muted"),
      classPair("bg-brand-5", "text-text-muted"),
      classPair("bg-accent", "text-dimmed"),
      classPair("bg-accent", "text-dimmed-0"),
      classPair("bg-tertiary", "text-dimmed-1"),
      classPair("bg-tertiary", "text-dimmed-2"),
      classPair("bg-status-danger-strong", "text-dimmed-3"),
      classPair("bg-status-danger-strong", "text-subtle"),
      classPair("bg-state-played", "text-soft"),
      classPair("bg-state-played", "text-quiet"),
      classPair("bg-premium", "text-faint"),
      classPair("bg-premium", "text-bright"),
      classPair("bg-brand", "text-chalk"),
      classPair("bg-accent", "text-pale"),
      {
        code: `const className = "bg-brand text-on-brand-alt hover:bg-brand hover:text-foreground";`,
        errors: [
          {
            messageId: "unsafeThemePairClass",
            data: {
              background: "hover:bg-brand",
              text: "hover:text-foreground",
            },
            line: 1,
          },
        ],
      },
      // Same variant prefix pairs (`data-[active]:`, `md:hover:`, arbitrary
      // variants with colons inside brackets).
      classPair("data-[active]:bg-brand", "data-[active]:text-foreground"),
      classPair("data-[state=on]:bg-premium", "data-[state=on]:text-dimmed-1"),
      classPair("hover:bg-accent", "hover:text-muted"),
      classPair("md:hover:!bg-brand", "md:hover:text-foreground"),
      classPair("[&>svg]:bg-accent", "[&>svg]:text-subtle"),
      // cn()/clsx() string arguments are one class list.
      {
        code: `const className = cn("flex", "bg-brand", "text-muted");`,
        errors: [
          {
            messageId: "unsafeThemePairClass",
            data: { background: "bg-brand", text: "text-muted" },
            line: 1,
          },
        ],
      },
      {
        code: `const className = twMerge(\n  "bg-accent",\n  "text-foreground",\n);`,
        errors: [
          {
            messageId: "unsafeThemePairClass",
            data: { background: "bg-accent", text: "text-foreground" },
            line: 2,
          },
        ],
      },
      // A template literal on one element is one class list.
      {
        code: 'const className = `bg-premium ${active ? "" : ""} text-subtle`;',
        errors: [
          {
            messageId: "unsafeThemePairClass",
            data: { background: "bg-premium", text: "text-subtle" },
            line: 1,
          },
        ],
      },
      // JSX className.
      {
        code: `const view = <div className="bg-brand text-muted" />;`,
        errors: [
          {
            messageId: "unsafeThemePairClass",
            data: { background: "bg-brand", text: "text-muted" },
            line: 1,
          },
        ],
      },
      // Style / CSS-variable objects (Mantine vars, JSX style objects).
      stylePair(
        "--button-bg",
        "var(--gn-brand)",
        "--button-color",
        "var(--gn-text)",
      ),
      stylePair(
        "--button-bg",
        "var(--gn-brand)",
        "--button-hover-color",
        "var(--gn-text)",
      ),
      stylePair(
        "--button-bg",
        "var(--gn-status-danger-strong)",
        "--button-color",
        "var(--gn-text)",
      ),
      stylePair(
        "--button-bg",
        "var(--gn-danger)",
        "--button-color",
        "var(--gn-text-color)",
      ),
      stylePair(
        "--badge-bg",
        "var(--gn-accent)",
        "--badge-color",
        "var(--gn-text)",
      ),
      stylePair(
        "--bg",
        "var(--gn-premium)",
        "--color-selected",
        "var(--gn-dimmed)",
      ),
      stylePair(
        "background",
        "var(--gn-brand-5)",
        "color",
        "var(--gn-text-muted)",
      ),
      stylePair(
        "backgroundColor",
        "var(--gn-state-played)",
        "color",
        "var(--mantine-color-text)",
      ),
      stylePair(
        "background",
        "var(--gn-tertiary)",
        "color",
        "var(--mantine-color-dimmed)",
      ),
      stylePair(
        "background",
        "var(--gn-danger)",
        "color",
        "var(--gn-dimmed-3)",
      ),
      // Multiline object reports on the background property line.
      {
        code: [
          "const vars = {",
          '  "--button-bg": "var(--gn-accent)",',
          '  "--button-color": "var(--gn-text)",',
          "};",
        ].join("\n"),
        errors: [
          {
            messageId: "unsafeThemePairStyle",
            data: {
              backgroundKey: "--button-bg",
              background: "var(--gn-accent)",
              textKey: "--button-color",
              text: "var(--gn-text)",
            },
            line: 2,
          },
        ],
      },
      // Missing reason on an exemption is reported and does not exempt.
      {
        code: [
          "// theme-exempt:",
          'const vars = { background: "var(--gn-brand)", color: "var(--gn-text)" };',
        ].join("\n"),
        errors: [
          { messageId: "exemptionNeedsReason", line: 1 },
          { messageId: "unsafeThemePairStyle", line: 2 },
        ],
      },
    ],
  });
});
