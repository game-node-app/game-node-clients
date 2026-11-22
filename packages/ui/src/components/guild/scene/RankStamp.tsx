import type { CSSProperties } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";

export interface RankStampProps {
  /** Guild rank letter, E to S. */
  rank: string;
  /** Diameter in px. Defaults to the card's 46. */
  size?: number;
  className?: string;
}

/**
 * The stamped rank seal: a rotated circle with "RANK" over the letter, in
 * Silkscreen over the artwork's stamp red.
 */
export function RankStamp({ rank, size = 46, className }: RankStampProps) {
  return (
    <span
      className={cn(styles.rankStamp, className)}
      data-rank={rank}
      style={
        {
          "--guild-rank-stamp-size": `${size}px`,
        } as CSSProperties
      }
    >
      <span className={cn(styles.stamp, styles.rankStampLabel)} aria-hidden>
        RANK
      </span>
      <span className={cn(styles.stamp, styles.rankStampLetter)}>{rank}</span>
    </span>
  );
}
