import { useTranslation } from "@repo/locales";
import type { CSSProperties } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";

import { getStampStyleClass } from "./cosmeticAssets";

export interface RankStampProps {
  /** Guild rank letter, E to S. */
  rank: string;
  /** Diameter in px. Defaults to the card's 46. */
  size?: number;
  /** Equipped `stamp_style` key; unknown keys keep the default theme ink. */
  styleKey?: string | null;
  className?: string;
}

/**
 * The stamped rank seal: a rotated circle with the rank label over the letter,
 * in Silkscreen over the artwork's stamp red. An equipped stamp style overrides
 * its border and ink (design D8).
 */
export function RankStamp({
  rank,
  size = 46,
  styleKey,
  className,
}: RankStampProps) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(styles.rankStamp, getStampStyleClass(styleKey), className)}
      data-rank={rank}
      data-stamp-style={styleKey ?? undefined}
      style={
        {
          "--guild-rank-stamp-size": `${size}px`,
        } as CSSProperties
      }
    >
      <span className={cn(styles.stamp, styles.rankStampLabel)} aria-hidden>
        {t("guild.rankLabel")}
      </span>
      <span className={cn(styles.stamp, styles.rankStampLetter)}>{rank}</span>
    </span>
  );
}
