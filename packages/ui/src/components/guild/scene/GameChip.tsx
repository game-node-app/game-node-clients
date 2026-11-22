import { cn } from "#@/util";

import styles from "../guild.module.css";

export interface GameChipProps {
  gameId?: number;
  name: string;
  coverUrl?: string | null;
  /** "desde 2023" / "~4h" style suffix, translated by the caller. */
  meta?: string;
  className?: string;
}

/**
 * A candidate game on a quest card: 16x20 cover, name and an optional meta
 * caption on the parchment chip.
 */
export function GameChip({
  gameId,
  name,
  coverUrl,
  meta,
  className,
}: GameChipProps) {
  return (
    <span
      className={cn(styles.gameChip, className)}
      data-game-id={gameId}
      title={meta ? `${name} · ${meta}` : name}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          width={16}
          height={20}
          draggable={false}
          loading={"lazy"}
          className={styles.gameChipCover}
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <span
          className={styles.gameChipCoverFallback}
          aria-hidden
          data-empty-cover
        />
      )}
      <span className={styles.gameChipName}>{name}</span>
      {meta ? <span className={styles.gameChipMeta}>{meta}</span> : null}
    </span>
  );
}
