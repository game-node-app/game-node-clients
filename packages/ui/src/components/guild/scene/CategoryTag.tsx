import type { ReactNode } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";

export type GuildCategory =
  | "library"
  | "event"
  | "weekly"
  | "gamenode"
  | "goal";

export interface CategoryTagProps {
  category: GuildCategory;
  children: ReactNode;
  className?: string;
}

const CATEGORY_CLASSES: Record<GuildCategory, string> = {
  library: styles.categoryTagLibrary,
  event: styles.categoryTagEvent,
  weekly: styles.categoryTagWeekly,
  gamenode: styles.categoryTagGamenode,
  goal: styles.categoryTagGoal,
};

/**
 * Quest category tag. Labels come from `guild.categoryTags.*`; this component
 * only owns the five colors of design D6 (theme tokens, no literals).
 */
export function CategoryTag({
  category,
  children,
  className,
}: CategoryTagProps) {
  return (
    <span
      className={cn(styles.categoryTag, CATEGORY_CLASSES[category], className)}
      data-category={category}
    >
      {children}
    </span>
  );
}
