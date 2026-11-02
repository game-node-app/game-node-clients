import {
  alpha,
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  Drawer,
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
    brand: colorsTuple("var(--gn-brand)"),
    secondary: colorsTuple("var(--gn-secondary)"),
    tertiary: colorsTuple("var(--gn-tertiary)"),
  },
  primaryColor: "brand",
  variantColorResolver,
  components: {
    // same frosted backdrop as the Spotlight command center (Mantine's Spotlight default)
    Drawer: Drawer.extend({ defaultProps: { overlayProps: { blur: 7 } } }),
  },
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
