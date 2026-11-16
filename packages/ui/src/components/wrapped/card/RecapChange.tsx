import {
  monoStyle,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import type { CSSProperties } from "react";

interface Props {
  /** Whole-percent change against the previous period; `null` draws nothing. */
  percent: number | null | undefined;
  /** Font size in card pixels. */
  size?: number;
  style?: CSSProperties;
}

/**
 * Small trend chip ("▲ 28%") for the opt-in comparison with the previous
 * period. It stays next to a figure instead of being a sentence of its own.
 */
export function RecapChange({ percent, size = 26, style }: Props) {
  if (percent == null) return null;

  const up = percent > 0;
  const down = percent < 0;
  const color = up
    ? RECAP_COLORS.positive
    : down
      ? RECAP_COLORS.negative
      : RECAP_COLORS.muted;

  return (
    <span
      className={"inline-flex items-center"}
      style={{
        ...monoStyle(size, color),
        gap: Math.round(size * 0.3),
        padding: `${Math.round(size * 0.2)}px ${Math.round(size * 0.5)}px`,
        borderRadius: 999,
        background: `${color}22`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      <span aria-hidden>{up ? "▲" : down ? "▼" : "–"}</span>
      {Math.abs(percent)}%
    </span>
  );
}
