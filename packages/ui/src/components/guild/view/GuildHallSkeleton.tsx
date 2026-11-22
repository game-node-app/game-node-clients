import { cn } from "#@/util/cn";

import styles from "../guild.module.css";

export interface GuildHallSkeletonProps {
  className?: string;
}

/**
 * Placeholder shown while the access decision (GuildView) or the overview
 * (GuildHall) is loading. It keeps the hall's frame, so the page does not jump
 * when the real content arrives.
 */
export function GuildHallSkeleton({ className }: GuildHallSkeletonProps) {
  return (
    <div
      className={cn(styles.hall, styles.skeleton, className)}
      aria-busy="true"
      data-testid="guild-hall-skeleton"
    >
      <div className={styles.skeletonHeader}>
        <span className={cn(styles.skeletonBlock, styles.skeletonTitle)} />
        <span className={cn(styles.skeletonBlock, styles.skeletonRank)} />
      </div>
      <span className={cn(styles.skeletonBlock, styles.skeletonScene)} />
      <div className={styles.skeletonContent}>
        <span className={cn(styles.skeletonBlock, styles.skeletonSidebar)} />
        <span className={cn(styles.skeletonBlock, styles.skeletonBoard)} />
      </div>
    </div>
  );
}
