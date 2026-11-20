import { describe, expect, it } from "vitest";
import { DEFAULT_MANTINE_THEME } from "../../../../packages/ui/src/util/theme";

const resolve = (color: string) =>
  DEFAULT_MANTINE_THEME.variantColorResolver({
    color,
    variant: "light",
    theme: DEFAULT_MANTINE_THEME,
  });

describe("light variant colors", () => {
  it("tints flat token palette instead of orange-on-brown", () => {
    expect(resolve("brand")).toMatchObject({
      background: "color-mix(in srgb, var(--gn-brand), transparent 85%)",
      hover: "color-mix(in srgb, var(--gn-brand), transparent 75%)",
      color: "var(--gn-brand)",
    });
  });

  it("leaves real palettes on Mantine defaults", () => {
    expect(resolve("teal").color).toBe("var(--mantine-color-teal-light-color)");
  });
});
