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
    expect(resolve("brand")).toMatchObject({
      background: "rgba(241, 80, 37, 0.15)",
      // brand lightened just enough to reach 4.5:1 on its own tint
      color: "#f25e36",
    });
  });

  it("leaves real palettes on Mantine defaults", () => {
    expect(resolve("teal").color).toBe("var(--mantine-color-teal-light-color)");
  });
});

describe("ThemeIcon default color", () => {
  it("is explicit so ThemeIcon goes through variantColorResolver", () => {
    expect(
      DEFAULT_MANTINE_THEME.components.ThemeIcon?.defaultProps?.color,
    ).toBe("brand");
  });
});
