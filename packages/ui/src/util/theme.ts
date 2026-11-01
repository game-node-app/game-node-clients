import {
  alpha,
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  mergeMantineTheme,
  parseThemeColor,
  VariantColorsResolver,
} from "@mantine/core";

/**
 * Mantine derives the dark "light" variant from shades 9 (bg) and 0 (text).
 * Our flat colorsTuple palettes make that orange-on-brown, so tint with the color itself instead.
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

const themeOverride = createTheme({
  fontFamily: "Roboto, Roboto Fallback",
  colors: {
    brand: colorsTuple("#F15025"),
    secondary: colorsTuple("#1A1A1A"),
    tertiary: colorsTuple("#872C13"),
  },
  primaryColor: "brand",
  variantColorResolver,
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
