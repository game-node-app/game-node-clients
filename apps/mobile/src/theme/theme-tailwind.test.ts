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
          raw: '<div class="bg-paper-0 bg-brand/40 bg-brand-5/10 border-brand/20 text-brand-5/[25%]"></div>',
          extension: "html",
        },
      ],
    }) as unknown as Plugin,
  ]).process("@tailwind utilities;", { from: undefined });

  const colors = new Map<string, string>();
  root.walkRules((rule) => {
    rule.walkDecls(
      /^(?:background-color|border-color|color)$/,
      (declaration) => {
        colors.set(rule.selector, declaration.value);
      },
    );
  });

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
});
