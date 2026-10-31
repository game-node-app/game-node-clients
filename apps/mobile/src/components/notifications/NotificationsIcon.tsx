import { Indicator } from "@mantine/core";
import { useInfiniteAggregatedNotifications } from "@repo/ui";
import { IconBell } from "@tabler/icons-react";
import { useMemo } from "react";

const NotificationsIcon = () => {
  const { data } = useInfiniteAggregatedNotifications();

  const hasUnreadNotifications = useMemo((): boolean => {
    const unreadCount = data?.pages[0]?.unreadCount ?? 0;
    if (unreadCount > 0) return true;

    return (
      data?.pages.some((page) =>
        page.data.some((item) => item.readVersion < item.version),
      ) ?? false
    );
  }, [data?.pages]);

  return (
    <Indicator
      position={"top-end"}
      processing
      disabled={!hasUnreadNotifications}
    >
      <IconBell />
    </Indicator>
  );
};

export default NotificationsIcon;