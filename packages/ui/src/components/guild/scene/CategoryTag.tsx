import type { ReactNode } from "react";
import { cn } from "#@/util";

import styles from "../guild.module.css";
import monthlyStyles from "./CategoryTag.module.css";

export type GuildCategory =
  | "library"
  | "event"
  | "weekly"
  | "gamenode"
  | "goal"
  | "monthly";

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
  monthly: monthlyStyles.monthly,
};

/**
 * Quest category tag. Labels come from `guild.board.tags.*`; this component
 * only owns the colors of design D6 (theme tokens and the theme-exempt Guild
 * palette, no literals). The Monthly Expedition variant uses the ink/gold
 * plate of design D6.
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
