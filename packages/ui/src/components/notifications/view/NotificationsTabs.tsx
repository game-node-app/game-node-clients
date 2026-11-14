import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";
import type { NotificationInboxFilter } from "../hooks/useInfiniteAggregatedNotifications";

export interface NotificationsTabsProps {
  value: NotificationInboxFilter;
  onChange: (value: NotificationInboxFilter) => void;
  unreadCount?: number;
}

const TABS: NotificationInboxFilter[] = ["all", "unread"];

/**
 * Notifications/Tabs. Segmented control over the inbox filters, with the
 * unread counter on the "Unread" tab.
 */
export function NotificationsTabs({
  value,
  onChange,
  unreadCount = 0,
}: NotificationsTabsProps) {
  const { t } = useTranslation();

  return (
    <div
      role="tablist"
      aria-label={t("notifications.title")}
      className={"flex w-fit gap-0.5 rounded-md bg-nav-canvas p-0.5"}
    >
      {TABS.map((tab) => {
        const selected = tab === value;
        const showCount = tab === "unread" && unreadCount > 0;

        return (
          <UnstyledButton
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={cn(
              "flex h-7 items-center justify-center gap-1.5 rounded-sm px-3",
              "text-[12px] font-normal leading-[normal] transition-colors",
              "focus-visible:[outline-style:solid] focus-visible:outline-2 focus-visible:[outline-offset:-2px] focus-visible:outline-brand-5",
              selected
                ? "bg-nav-raised text-nav-text"
                : "text-nav-muted hover:text-nav-text",
            )}
          >
            <span>{t(`notifications.tabs.${tab}`)}</span>
            {showCount && (
              <span
                className={
                  "flex h-4 items-center rounded-md bg-brand-5 px-[5px] text-[12px] font-normal leading-[normal] text-nav-canvas"
                }
              >
                {unreadCount}
              </span>
            )}
          </UnstyledButton>
        );
      })}
    </div>
  );
}
