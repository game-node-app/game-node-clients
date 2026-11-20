import type { CSSProperties } from "react";

/**
 * Tokens shared by the export cards. The cards are rasterised at a fixed
 * native size, so everything here is in plain pixels / hex values and never
 * depends on the app theme or the screen.
 */
// theme-exempt: recap export card artwork (rasterised fixed palette)
export const RECAP_COLORS = {
  brand: "#F15025",
  ground: "#0F0E0D",
  panel: "#1C1A18",
  ink: "#0B0A09",
  cream: "#F4EFE8",
  muted: "#A39B90",
  dim: "#6E675E",
  positive: "#2DD4A4",
  negative: "#FF6B5E",
} as const;

/**
 * Typefaces of the cards (the same pair Echo uses). They are declared by
 * `RecapCardFonts`, which loads the files from each app's `public/font`.
 */
export const RECAP_FONTS = {
  display: "'Recap Display', Roboto, sans-serif",
  mono: "'Recap Mono', ui-monospace, monospace",
} as const;

/** Heavy display type with the tight tracking the big figures need. */
export const displayStyle = (
  size: number,
  color: string = RECAP_COLORS.cream,
  weight: number = 800,
): CSSProperties => ({
  fontFamily: RECAP_FONTS.display,
  fontSize: size,
  fontWeight: weight,
  letterSpacing: "-0.03em",
  lineHeight: 0.92,
  color,
});

/** Small tracked mono caption, used for every label and figure caption. */
export const monoStyle = (
  size: number,
  color: string = RECAP_COLORS.muted,
  bold: boolean = true,
): CSSProperties => ({
  fontFamily: RECAP_FONTS.mono,
  fontSize: size,
  fontWeight: bold ? 700 : 400,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color,
  lineHeight: 1.25,
});

/**
 * Absolute placement in card pixels, so layouts map 1:1 to the design. The
 * size is only part of the style when given: a spread `width: undefined` would
 * otherwise wipe the size of the element it is merged into (e.g. a cover).
 */
export const at = (
  x: number,
  y: number,
  width?: number,
  height?: number,
): CSSProperties => ({
  position: "absolute",
  left: x,
  top: y,
  ...(width !== undefined ? { width } : {}),
  ...(height !== undefined ? { height } : {}),
});

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours}` : hours.toFixed(1);
}

/** "12h 30m" style duration for the per-game rows. */
export function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${Math.max(minutes, 1)}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/**
 * Font size that keeps `text` on one line inside `width`, never above `max`.
 * Bricolage Grotesque caps average about 0.62em with the card tracking.
 */
export function fitFontSize(text: string, width: number, max: number): number {
  return Math.round(Math.min(max, width / (0.62 * Math.max(text.length, 1))));
}
