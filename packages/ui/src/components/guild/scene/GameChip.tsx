import { cn, Link } from "#@/util";

import styles from "../guild.module.css";

export interface GameChipProps {
  gameId?: number;
  name: string;
  coverUrl?: string | null;
  /** "desde 2023" / "~4h" style suffix, translated by the caller. */
  meta?: string;
  /** Set to false when rendered inside an interactive control (e.g. radio button). */
  linked?: boolean;
  className?: string;
}

/**
 * A candidate game on a quest card: 20x27 cover, name and an optional meta
 * caption on the parchment chip. Links to `/game/${gameId}` when a numeric
 * `gameId` is provided and `linked` is not disabled.
 */
export function GameChip({
  gameId,
  name,
  coverUrl,
  meta,
  linked = true,
  className,
}: GameChipProps) {
  const title = meta ? `${name} · ${meta}` : name;
  const shouldLink =
    linked && typeof gameId === "number" && Number.isFinite(gameId);

  const content = (
    <>
      {coverUrl ? (
        <img
          src={coverUrl}
          alt=""
          width={20}
          height={27}
          draggable={false}
          loading={"lazy"}
          className={styles.gameChipCover}
          style={{ width: 20, height: 27, imageRendering: "auto" }}
        />
      ) : (
        <span
          className={styles.gameChipCoverFallback}
          style={{ width: 20, height: 27 }}
          aria-hidden
          data-empty-cover
        />
      )}
      <span className={styles.gameChipName}>{name}</span>
      {meta ? <span className={styles.gameChipMeta}>{meta}</span> : null}
    </>
  );

  if (shouldLink) {
    return (
      <Link
        href={`/game/${gameId}`}
        className={cn(styles.gameChip, "no-underline hover:underline", className)}
        data-game-id={gameId}
        title={title}
      >
        {content}
      </Link>
    );
  }

  return (
    <span
      className={cn(styles.gameChip, className)}
      data-game-id={gameId}
      title={title}
    >
      {content}
    </span>
  );
}
