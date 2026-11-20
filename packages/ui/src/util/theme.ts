import {
  alpha,
  Chip,
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  type MantineColorsTuple,
  mergeMantineTheme,
  MantineTheme,
  parseThemeColor,
  SegmentedControl,
  ThemeIcon,
  VariantColorsResolver,
} from "@mantine/core";
import classes from "./theme.module.css";

const LIGHT_TINT_ALPHA = 0.15;

/** The single colour of a flat palette (`brand`, `secondary`, ...), or null for real palettes. */
function getFlatPaletteColor(
  color: string,
  theme: MantineTheme,
): string | null {
  const parsed = parseThemeColor({ color, theme });
  const shades = theme.colors[parsed.color];
  if (!parsed.isThemeColor || !shades || new Set(shades).size > 1) return null;
  return shades[0] ?? null;
}

function getContrastToken(color: string, variant: "filled" | "light") {
  const token = /^var\((--gn-(?:brand|secondary|tertiary))\)$/.exec(color)?.[1];
  return token ? `var(${token}-${variant}-text)` : undefined;
}

/** Use the active theme's contrast colors with Mantine's flat palettes. */
export const variantColorResolver: VariantColorsResolver = (input) => {
  const defaults = defaultVariantColorsResolver(input);
  if (
    (input.variant !== "light" && input.variant !== "filled") ||
    !input.color
  ) {
    return defaults;
  }
  const flat = getFlatPaletteColor(input.color, input.theme);
  if (!flat) return defaults;

  const color = getContrastToken(flat, input.variant);
  if (input.variant === "filled") {
    return color ? { ...defaults, color } : defaults;
  }
  return {
    ...defaults,
    background: alpha(flat, LIGHT_TINT_ALPHA),
    hover: alpha(flat, 0.25),
    color: color ?? flat,
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
  // 0.179 is where white text drops below 4.5:1 (Mantine's default is 0.3), so `autoContrast`
  // agrees with `getFilledTextColor`.
  luminanceThreshold: 0.179,
  variantColorResolver,
  components: {
    // Without a `color`, ThemeIcon skips `variantColorResolver` and falls back to
    // Mantine's CSS defaults (white on the primary fill, orange-on-brown light).
    ThemeIcon: ThemeIcon.extend({ defaultProps: { color: "brand" } }),
    // Same for Chip: with no `color`/`variant` it keeps white text on the primary fill.
    Chip: Chip.extend({ defaultProps: { color: "brand" } }),
    // SegmentedControl handles its own active label and can't measure CSS variables.
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { autoContrast: true },
      classNames: { label: classes.segmentedControlLabel },
      styles: (theme, { autoContrast, color }) => {
        if (autoContrast === false || !color) return {};
        const flat = getFlatPaletteColor(color, theme);
        const contrast = flat && getContrastToken(flat, "filled");
        return contrast
          ? { label: { "--gn-segmented-label-color": contrast } }
          : {};
      },
    }),
  },
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
