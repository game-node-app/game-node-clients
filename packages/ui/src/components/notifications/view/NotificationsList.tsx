import { ScrollArea } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useEffect, useRef, useState } from "react";
import { cn } from "#@/util";
import { NotificationSkeleton } from "../NotificationSkeleton";
import type { NotificationInboxFilter } from "../hooks/useInfiniteAggregatedNotifications";
import { useNotificationsInbox } from "../hooks/useNotificationsInbox";
import type { NotificationDateGroupKey } from "../util/groupNotificationsByDate";
import { InboxNotificationItem } from "./InboxNotificationItem";
import { NotificationsSectionTitle } from "./NotificationsSectionTitle";
import { NotificationsTabs } from "./NotificationsTabs";

const SECTION_LABEL_KEYS = {
  today: "notifications.sections.today",
  week: "notifications.sections.thisWeek",
  older: "notifications.sections.earlier",
} as const satisfies Record<NotificationDateGroupKey, string>;

const SKELETON_COUNT = 4;

export interface NotificationsListProps {
  /** Called after an item is activated, e.g. to close the web popover. */
  onItemNavigate?: () => void;
  /**
   * Whether the list must fill a fixed-height parent (the web popover). The
   * page variant grows with its content instead.
   */
  fill?: boolean;
}

/**
 * Notifications inbox tabs and grouped list: one server query per filter, date
 * sections, skeletons, empty state per tab and an intersection sentinel that
 * requests the next page.
 */
export function NotificationsList({
  onItemNavigate,
  fill = false,
}: NotificationsListProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<NotificationInboxFilter>("all");

  const allInbox = useNotificationsInbox({ filter: "all" });
  const unreadInbox = useNotificationsInbox({ filter: "unread" });
  const inbox = filter === "unread" ? unreadInbox : allInbox;

  const { fetchNextPage, hasNextPage, isFetching } = inbox;

  const items = inbox.sections.flatMap((section) => section.items);
  const showSkeletons = inbox.isLoading || (isFetching && items.length === 0);
  // A server page may be empty while it still has more results (limited
  // refill): only show the empty state once pagination is exhausted.
  const isEmpty = !showSkeletons && items.length === 0 && !hasNextPage;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    // Older WebViews and jsdom may not provide IntersectionObserver.
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !isFetching) {
        fetchNextPage();
      }
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching]);

  return (
    <div className={cn("flex flex-col gap-1", fill && "min-h-0 flex-1")}>
      <div className={"px-1 pb-1"}>
        <NotificationsTabs
          value={filter}
          onChange={setFilter}
          unreadCount={inbox.unreadCount}
        />
      </div>

      <div className={"h-px w-full bg-nav-border"} />

      <ScrollArea className={cn(fill && "min-h-0 flex-1")}>
        <div className={"flex flex-col gap-1 pb-1"}>
          {showSkeletons &&
            Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <NotificationSkeleton key={index} />
            ))}

          {!showSkeletons &&
            inbox.sections.map((section) => (
              <div key={section.key} className={"flex flex-col"}>
                <NotificationsSectionTitle>
                  {t(SECTION_LABEL_KEYS[section.key])}
                </NotificationsSectionTitle>
                {section.items.map((item) => (
                  <InboxNotificationItem
                    key={`${item.id}-${item.version}`}
                    item={item}
                    onNavigate={onItemNavigate}
                  />
                ))}
              </div>
            ))}

          {isEmpty && (
            <p
              className={
                "px-3 py-6 text-center text-[14px] font-normal leading-[normal] text-nav-muted"
              }
            >
              {t(
                filter === "unread"
                  ? "notifications.emptyUnread"
                  : "notifications.empty",
              )}
            </p>
          )}

          <div ref={sentinelRef} aria-hidden="true" className={"h-px w-full"} />
        </div>
      </ScrollArea>
    </div>
  );
}
