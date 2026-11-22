import type { CSSProperties } from "react";

/**
 * Surface pair helpers for text and controls over imagery. The pair is
 * `--gn-media-scrim*` (fill) and `--gn-media-text*` (ink), exposed as
 * `bg-media-scrim`, `text-media`, `text-media-muted`, `text-media-dim` and the
 * `media-ink` utility. Use `--gn-media-content-scrim` (`bg-media-content-scrim`)
 * directly behind text and controls over artwork. Lighter fades can sit
 * outside the content area.
 */

/**
 * Inline variables for a Mantine `Button variant="white"` placed on a media
 * scrim: an inverted button (media text as the fill, scrim as the label).
 */
export const MEDIA_BUTTON_STYLE = {
  "--button-bg": "var(--gn-media-text)",
  "--button-hover": "var(--gn-media-text-muted)",
  "--button-color": "var(--gn-media-scrim-strong)",
} as CSSProperties;
