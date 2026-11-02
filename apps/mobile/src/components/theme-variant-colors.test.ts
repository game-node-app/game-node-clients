import { describe, expect, it } from "vitest";
import { DEFAULT_MANTINE_THEME } from "../../../../packages/ui/src/util/theme";

const resolve = (color: string) =>
  DEFAULT_MANTINE_THEME.variantColorResolver({
    color,
    variant: "light",
    theme: DEFAULT_MANTINE_THEME,
  });

describe("light variant colors", () => {
  it("tints flat brand palette instead of orange-on-brown", () => {
    // brand is a theme token (themes.css), so the tint must stay a CSS expression
    expect(resolve("brand")).toMatchObject({
      background: "color-mix(in srgb, var(--gn-brand), transparent 85%)",
      color: "var(--gn-brand)",
    });
  });

  it("leaves real palettes on Mantine defaults", () => {
    expect(resolve("teal").color).toBe("var(--mantine-color-teal-light-color)");
  });
});
