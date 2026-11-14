import type { ReactNode } from "react";

export interface NotificationsSectionTitleProps {
  children: ReactNode;
}

/**
 * Notifications/Section title: the "Today", "This week" and "Earlier" labels
 * above each group of items.
 */
export function NotificationsSectionTitle({
  children,
}: NotificationsSectionTitleProps) {
  return (
    <div
      className={
        "pl-3 pt-2 pb-1 text-[12px] font-normal leading-[normal] text-nav-muted"
      }
    >
      {children}
    </div>
  );
}
