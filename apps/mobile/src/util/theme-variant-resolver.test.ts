import { DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_MANTINE_THEME,
  variantColorResolver,
} from "../../../../packages/ui/src/util/theme";

type Rgb = [number, number, number];

const hex = (value: string): Rgb => {
  const n = parseInt(value.replace("#", "").slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const luminance = ([r, g, b]: Rgb) => {
  const [lr, lg, lb] = [r, g, b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
};

const contrast = (a: Rgb, b: Rgb) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** `rgba(r, g, b, a)` composited over an opaque surface. */
const flatten = (rgba: string, surface: Rgb): Rgb => {
  const [r, g, b, a] = /rgba\(([^)]+)\)/
    .exec(rgba)![1]!
    .split(",")
    .map(Number) as [number, number, number, number];
  return [r, g, b].map((c, i) => c * a + surface[i]! * (1 - a)) as Rgb;
};

const resolve = (color: string, variant: "filled" | "light") =>
  variantColorResolver({
    color,
    theme: DEFAULT_MANTINE_THEME,
    variant,
    gradient: undefined,
    autoContrast: false,
  });

const colorOf = (value: string): Rgb =>
  value.startsWith("#") ? hex(value) : flatten(value, [0, 0, 0]);

describe("variantColorResolver", () => {
  it("uses dark text on the brand fill (white is only 3.6:1)", () => {
    const result = resolve("brand", "filled");

    expect(result.color).toBe("#111111");
    expect(contrast(hex("#111111"), hex("#F15025"))).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrast(hex("#FFFFFF"), hex("#F15025"))).toBeLessThan(4.5);
  });

  it("keeps white text on fills where it already reaches 4.5:1", () => {
    expect(resolve("tertiary", "filled").color).toBe("#FFFFFF");
    expect(resolve("secondary", "filled").color).toBe("#FFFFFF");
  });

  it("lifts the brand light text to 4.5:1 on its tint over the surfaces", () => {
    const result = resolve("brand", "light");
    const text = colorOf(result.color);

    for (const surface of ["#111111", "#1A1A1A"]) {
      const tint = flatten(result.background, hex(surface));
      expect(contrast(text, tint)).toBeGreaterThanOrEqual(4.5);
    }
    // Brand-ish, only lightened a little (the plain #F15025 gives 4.1:1).
    expect(result.color).not.toBe("#f15025");
    expect(hex(result.color)[0]).toBeGreaterThanOrEqual(0xf1);
  });

  it("leaves non-flat palettes and other variants on Mantine defaults", () => {
    const theme = mergeMantineTheme(DEFAULT_THEME, {});
    const input = {
      theme,
      gradient: undefined,
      autoContrast: false,
    };

    expect(
      variantColorResolver({ ...input, color: "teal", variant: "filled" })
        .color,
    ).toBe("var(--mantine-color-white)");
    expect(
      variantColorResolver({ ...input, color: "brand", variant: "outline" })
        .color,
    ).toBeDefined();
  });
});
