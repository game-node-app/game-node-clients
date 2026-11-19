import {
  alpha,
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  defaultVariantColorsResolver,
  mergeMantineTheme,
  parseThemeColor,
  ThemeIcon,
  VariantColorsResolver,
} from "@mantine/core";

const MIN_TEXT_CONTRAST = 4.5;
/** Text on filled flat palettes when white is too weak: the app background. */
const DARK_TEXT = "#111111";
/**
 * The lightest dark surface a tinted ("light") control normally sits on (the
 * `secondary` card colour); checking against it also covers the app background.
 */
const TINT_SURFACE = "#1A1A1A";

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const value = parseInt(match[1]!, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}`;
}

function luminance([r, g, b]: Rgb): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as Rgb;
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/** WCAG 2.x contrast ratio between two colours. */
function getContrastRatio(a: Rgb, b: Rgb): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function mixRgb(from: Rgb, to: Rgb, amount: number): Rgb {
  return from.map(
    (channel, index) => channel + (to[index]! - channel) * amount,
  ) as Rgb;
}

/** Text colour for a solid fill: white while it reaches 4.5:1, otherwise the dark app background. */
function getFilledTextColor(fill: string): string | null {
  const rgb = hexToRgb(fill);
  if (!rgb) return null;
  return getContrastRatio(rgb, [255, 255, 255]) >= MIN_TEXT_CONTRAST
    ? "#FFFFFF"
    : DARK_TEXT;
}

/**
 * Text colour for a tinted ("light") control: the palette colour, lightened
 * toward white only as far as needed to reach 4.5:1 on its own tint over the
 * dark surface.
 */
function getLightTextColor(color: string, tintAlpha: number): string | null {
  const rgb = hexToRgb(color);
  const surface = hexToRgb(TINT_SURFACE);
  if (!rgb || !surface) return null;
  const background = mixRgb(surface, rgb, tintAlpha);
  for (let step = 0; step <= 100; step++) {
    const candidate = mixRgb(rgb, [255, 255, 255], step / 100);
    if (getContrastRatio(candidate, background) >= MIN_TEXT_CONTRAST) {
      return rgbToHex(candidate);
    }
  }
  return "#FFFFFF";
}

const LIGHT_TINT_ALPHA = 0.15;

/**
 * Mantine derives the dark "light" variant from shades 9 (bg) and 0 (text).
 * Our flat colorsTuple palettes make that orange-on-brown, so tint with the color itself instead.
 * Both variants also pick their text colour by WCAG contrast (4.5:1), since the
 * brand orange is too light for white text and too dark for itself on its tint.
 */
export const variantColorResolver: VariantColorsResolver = (input) => {
  const defaults = defaultVariantColorsResolver(input);
  if (
    (input.variant !== "light" && input.variant !== "filled") ||
    !input.color
  ) {
    return defaults;
  }
  const parsed = parseThemeColor({ color: input.color, theme: input.theme });
  const shades = input.theme.colors[parsed.color];
  if (!parsed.isThemeColor || !shades || new Set(shades).size > 1) {
    return defaults;
  }
  if (input.variant === "filled") {
    const color = getFilledTextColor(shades[0]!);
    return color ? { ...defaults, color } : defaults;
  }
  return {
    ...defaults,
    background: alpha(shades[0]!, LIGHT_TINT_ALPHA),
    hover: alpha(shades[0]!, 0.25),
    color: getLightTextColor(shades[0]!, LIGHT_TINT_ALPHA) ?? shades[0]!,
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
  components: {
    // Without a `color`, ThemeIcon skips `variantColorResolver` and falls back to
    // Mantine's CSS defaults (white on the primary fill, orange-on-brown light).
    ThemeIcon: ThemeIcon.extend({ defaultProps: { color: "brand" } }),
  },
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
