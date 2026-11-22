import type { CSSProperties } from "react";

/**
 * Accent contrast math for supporter perks (design D3).
 *
 * Stored accents are arbitrary `#RRGGBB` values; the profile never changes the
 * stored value. Text and decorations are drawn in a lightened shade when the
 * stored color is too dark for the dark surfaces used by the profile header.
 */

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

const ON_ACCENT_LIGHT = "#FFFFFF";
const ON_ACCENT_DARK = "#141414";

/** Default dark surface used by the profile header and the settings preview. */
export const ACCENT_SURFACE = "#161616";

/** `#RRGGBB` uppercase, or null when the value is not a 6-digit hex color. */
export function normalizeAccentHex(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const match = HEX_PATTERN.exec(value.trim());

  return match ? `#${match[1].toUpperCase()}` : null;
}

function parseRgb(hex: string): [number, number, number] {
  const normalized = normalizeAccentHex(hex);

  if (!normalized) {
    throw new Error(`Invalid hex color: ${String(hex)}`);
  }

  return [
    parseInt(normalized.slice(1, 3), 16),
    parseInt(normalized.slice(3, 5), 16),
    parseInt(normalized.slice(5, 7), 16),
  ];
}

/** WCAG 2.x relative luminance of a `#RRGGBB` color. */
export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseRgb(hex).map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two `#RRGGBB` colors. */
export function getContrastRatio(a: string, b: string): number {
  const luminanceA = getRelativeLuminance(a);
  const luminanceB = getRelativeLuminance(b);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}

function mixTowardWhite(hex: string, ratio: number): string {
  const [r, g, b] = parseRgb(hex);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * ratio);

  return `#${[r, g, b]
    .map((channel) => mix(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

/**
 * Returns `hex` when it already meets `minRatio` against `surface`; otherwise
 * mixes it toward white in 5% steps (20 steps → white). All supported surfaces
 * are dark, so lightening is always the correct direction.
 */
export function getReadableAccent(
  hex: string,
  surface: string = ACCENT_SURFACE,
  minRatio: number = 4.5,
): string {
  const normalized = normalizeAccentHex(hex);

  if (!normalized) return hex;
  if (getContrastRatio(normalized, surface) >= minRatio) return normalized;

  for (let step = 1; step <= 20; step++) {
    const candidate = mixTowardWhite(normalized, step * 0.05);

    if (getContrastRatio(candidate, surface) >= minRatio) return candidate;
  }

  return "#FFFFFF";
}

/** `rgba(r, g, b, alpha)` for a `#RRGGBB` color, alpha clamped to 0…1. */
export function hexToRgba(hex: string, alpha: number): string {
  const [r, g, b] = parseRgb(hex);
  const clampedAlpha = Math.min(1, Math.max(0, alpha));

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

/**
 * White or near-black text drawn on top of `hex`, whichever contrasts more
 * (the "Supporter" label on the theme strip).
 */
export function getOnAccentText(hex: string): string {
  const normalized = normalizeAccentHex(hex);

  if (!normalized) return ON_ACCENT_LIGHT;

  return getContrastRatio(normalized, ON_ACCENT_DARK) >
    getContrastRatio(normalized, ON_ACCENT_LIGHT)
    ? ON_ACCENT_DARK
    : ON_ACCENT_LIGHT;
}

/**
 * Custom property holding the theme-aware text color of a supporter accent, and
 * the Tailwind class that paints text with it. Elements set the property inline
 * (see {@link getAccentInkStyle}) and add the class.
 */
export const ACCENT_INK_VAR = "--supporter-ink";
export const ACCENT_INK_CLASS = "text-[color:var(--supporter-ink)]";

/** The premium violet used for supporter text when the profile theme is off. */
// theme-exempt: fixed premium violet; light themes cap its lightness via getAccentInk
export const PREMIUM_TEXT_HEX = "#c7a6ff";

/**
 * Accent as *text* on the active theme's surfaces.
 *
 * {@link getReadableAccent} only lightens, which is right for dark themes and
 * wrong for light ones (a lightened violet on paper is ~2:1). This keeps the
 * hue and chroma but caps OKLCH lightness at `--gn-ink-max-l`, a token only
 * light themes define (Ruins sets it in its pack CSS). Without the token the cap
 * is `1`, so dark themes render `hex` unchanged. Fills and borders keep the raw
 * accent; only text goes through this.
 */
export function getAccentInk(hex: string): string {
  return `oklch(from ${hex} min(l, var(--gn-ink-max-l, 1)) c h)`;
}

/** Inline style that exposes `ink` to {@link ACCENT_INK_CLASS}. */
export function getAccentInkStyle(ink: string): CSSProperties {
  return { [ACCENT_INK_VAR]: ink } as CSSProperties;
}
