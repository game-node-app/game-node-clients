import { Indicator } from "@mantine/core";
import { useInfiniteAggregatedNotifications } from "@repo/ui";
import { IconBell } from "@tabler/icons-react";

const MAX_BADGE_COUNT = 99;

/**
 * Tab bar bell. Shows the unread count; falls back to a plain dot when the
 * loaded items are unread but the server count is missing or zero.
 */
const NotificationsIcon = () => {
  const query = useInfiniteAggregatedNotifications();
  const data = query.isPlaceholderData ? undefined : query.data;

  const unreadCount = data?.pages[0]?.unreadCount ?? 0;
  const hasUnreadItems =
    data?.pages.some((page) =>
      page.data.some((item) => item.readVersion < item.version),
    ) ?? false;

  const showCount = unreadCount > 0;
  const label =
    unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount;

  return (
    <Indicator
      position={"top-end"}
      offset={4}
      size={showCount ? 16 : 8}
      label={showCount ? label : undefined}
      disabled={!showCount && !hasUnreadItems}
      withBorder
      styles={{
        indicator: { fontSize: 10, fontWeight: 700, padding: "0 4px" },
      }}
    >
      <IconBell />
    </Indicator>
  );
};

export default NotificationsIcon;
