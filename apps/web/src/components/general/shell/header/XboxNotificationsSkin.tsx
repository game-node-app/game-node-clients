import type { ReactNode } from "react";
import { cn } from "@repo/ui";
import styles from "./XboxNotificationsSkin.module.css";

interface Props {
  /** Popover (fixed height) or the notifications page (card in the page flow). */
  variant?: "popover" | "page";
  className?: string;
  children: ReactNode;
}

/**
 * Xbox look for the web notifications panel (reference commit `574ffa3b`,
 * adapted to the current inbox markup): dark panel, plain heading, pill tabs
 * and rows as tiles with the green focus ring drawn inside the row.
 *
 * The shared `NotificationsPanel` keeps the data, read state and actions. This
 * wrapper only styles it, and lives in a chunk loaded when the Xbox screens are
 * active, so `gamenode` never downloads it.
 */
export default function XboxNotificationsSkin({
  variant = "popover",
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        styles.skin,
        variant === "page" ? styles.page : styles.popover,
        className,
      )}
      data-xbox-notifications=""
      data-variant={variant}
    >
      {children}
    </div>
  );
}
