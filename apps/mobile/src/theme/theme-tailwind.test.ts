import postcss, { type Plugin } from "postcss";
import tailwindcss from "tailwindcss";
import { expect, it } from "vitest";
import themeConfig from "../../../../packages/config-tailwind/tailwind.config";

it("compiles theme colors with and without opacity modifiers", async () => {
  const { root } = await postcss([
    // Tailwind and mobile resolve different PostCSS 8 patches.
    tailwindcss({
      ...themeConfig,
      content: [
        {
          raw: '<div class="text-foreground bg-highlight/20 font-mono bg-paper-0 bg-brand/40 bg-brand-5/10 border-brand/20 text-brand-5/[25%] text-subtle text-faint bg-panel bg-panel-inset border-panel-line text-on-brand bg-media-scrim/75 text-media text-media-muted text-media-dim from-media-scrim/60 bg-media-fade media-ink"></div>',
          extension: "html",
        },
      ],
    }) as unknown as Plugin,
  ]).process("@tailwind utilities;", { from: undefined });

  const colors = new Map<string, string>();
  const fonts = new Map<string, string>();
  root.walkRules((rule) => {
    rule.walkDecls("font-family", (declaration) => {
      fonts.set(rule.selector, declaration.value);
    });
  });
  root.walkRules((rule) => {
    rule.walkDecls(
      /^(?:background-color|border-color|color)$/,
      (declaration) => {
        colors.set(rule.selector, declaration.value);
      },
    );
  });

  expect(colors.get(".text-foreground")).toContain("var(--gn-text)");
  expect(colors.get(".bg-highlight\\/20")).toContain(
    "var(--gn-highlight) calc(0.2 * 100%)",
  );
  expect(fonts.get(".font-mono")).toBe("var(--gn-font-mono)");
  expect(colors.get(".bg-paper-0")).toContain("var(--gn-paper-0)");
  expect(colors.get(".bg-brand\\/40")).toContain(
    "var(--gn-brand) calc(0.4 * 100%)",
  );
  expect(colors.get(".bg-brand-5\\/10")).toContain(
    "var(--gn-brand-5) calc(0.1 * 100%)",
  );
  expect(colors.get(".border-brand\\/20")).toContain(
    "var(--gn-brand) calc(0.2 * 100%)",
  );
  expect(colors.get(".text-brand-5\\/\\[25\\%\\]")).toContain(
    "var(--gn-brand-5) 25%",
  );
  expect(colors.get(".text-subtle")).toContain("var(--gn-text-subtle)");
  expect(colors.get(".text-faint")).toContain("var(--gn-text-faint)");
  expect(colors.get(".text-on-brand")).toContain("var(--gn-text-on-brand)");
  expect(colors.get(".bg-panel")).toContain("var(--gn-panel)");
  expect(colors.get(".bg-panel-inset")).toContain("var(--gn-panel-inset)");
  expect(colors.get(".border-panel-line")).toContain("var(--gn-panel-line)");
  expect(colors.get(".bg-media-scrim\\/75")).toContain(
    "var(--gn-media-scrim) calc(0.75 * 100%)",
  );
  expect(colors.get(".text-media")).toContain("var(--gn-media-text)");
  expect(colors.get(".text-media-muted")).toContain(
    "var(--gn-media-text-muted)",
  );
  expect(colors.get(".text-media-dim")).toContain("var(--gn-media-text-dim)");
  expect(colors.get(".bg-media-fade")).toContain("var(--gn-media-fade)");
  // The utility holds both halves of the pair for Mantine text.
  expect(colors.get(".media-ink")).toContain("var(--gn-media-text)");
});
