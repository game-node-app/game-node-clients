import {
  alpha,
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  type MantineColorsTuple,
  mergeMantineTheme,
  parseThemeColor,
  VariantColorsResolver,
} from "@mantine/core";

/**
 * Mantine derives the dark "light" variant from shades 9 (bg) and 0 (text).
 * Our flat token palettes make that orange-on-brown, so tint with the color itself instead.
 */
export const variantColorResolver: VariantColorsResolver = (input) => {
  const defaults = defaultVariantColorsResolver(input);
  if (input.variant !== "light" || !input.color) return defaults;
  const parsed = parseThemeColor({ color: input.color, theme: input.theme });
  const shades = input.theme.colors[parsed.color];
  if (!parsed.isThemeColor || !shades || new Set(shades).size > 1) {
    return defaults;
  }
  return {
    ...defaults,
    background: alpha(shades[0], 0.15),
    hover: alpha(shades[0], 0.25),
    color: shades[0],
  };
};

/**
 * Saturated palettes stay flat on purpose (as before the token system): every
 * shade resolves to the active theme's brand/secondary/tertiary token, while
 * the Tailwind `brand-0…9` ramp keeps the generated steps.
 */
const darkColors = [
  "var(--gn-dark-0)",
  "var(--gn-dark-1)",
  "var(--gn-dark-2)",
  "var(--gn-dark-3)",
  "var(--gn-dark-4)",
  "var(--gn-dark-5)",
  "var(--gn-dark-6)",
  "var(--gn-dark-7)",
  "var(--gn-dark-8)",
  "var(--gn-dark-9)",
] as const satisfies MantineColorsTuple;

const themeOverride = createTheme({
  fontFamily: "var(--gn-font)",
  defaultRadius: "var(--gn-radius)",
  colors: {
    brand: colorsTuple("var(--gn-brand)"),
    secondary: colorsTuple("var(--gn-secondary)"),
    tertiary: colorsTuple("var(--gn-tertiary)"),
    dark: darkColors,
  },
  primaryColor: "brand",
  variantColorResolver,
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
