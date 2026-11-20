import { readFileSync } from "node:fs";
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

const resolve = (color: string, variant: "filled" | "light") =>
  variantColorResolver({
    color,
    theme: DEFAULT_MANTINE_THEME,
    variant,
    gradient: undefined,
    autoContrast: false,
  });

const themeCss = readFileSync(
  new URL(
    "../../../../packages/ui/src/theme/generated/themes.css",
    import.meta.url,
  ),
  "utf8",
);

const readToken = (theme: "gamenode" | "xbox", token: string) => {
  const block = themeCss
    .split(`:root[data-theme="${theme}"] {`)[1]!
    .split("}")[0];
  const value = block.match(
    new RegExp(`--gn-${token}: (#[0-9a-f]{6});`, "i"),
  )?.[1];
  if (!value) throw new Error(`Missing ${token} for ${theme}`);
  return hex(value);
};

describe("variantColorResolver", () => {
  it.each(["gamenode", "xbox"] as const)(
    "keeps text readable on filled and tinted controls in %s",
    (theme) => {
      for (const palette of ["brand", "secondary", "tertiary"]) {
        const base = readToken(theme, palette);
        const filled = readToken(theme, `${palette}-filled-text`);
        const light = readToken(theme, `${palette}-light-text`);
        const tintSurface = readToken(theme, "secondary");
        const tint = base.map((channel, index) =>
          Math.round(channel * 0.15 + tintSurface[index]! * 0.85),
        ) as Rgb;
        expect(resolve(palette, "filled").color).toBe(
          `var(--gn-${palette}-filled-text)`,
        );
        expect(resolve(palette, "light").color).toBe(
          `var(--gn-${palette}-light-text)`,
        );
        expect(contrast(filled, base)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(light, tint)).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

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
