import React, { useMemo } from "react";
import { IconBell } from "@tabler/icons-react";
import { Indicator } from "@mantine/core";
import { useInfiniteAggregatedNotifications } from "@/components/notifications/hooks/useInfiniteAggregatedNotifications";

const NotificationsIcon = () => {
    const { data } = useInfiniteAggregatedNotifications();

    const aggregations = useMemo(() => {
        return data?.pages.flatMap((response) => response.data.map((aggregation) => aggregation));
    }, [data?.pages]);

    const hasUnreadNotifications = useMemo((): boolean => {
        if (aggregations == undefined || aggregations.length === 0) return false;

        for (const aggregation of aggregations) {
            const unread = aggregation.notifications.some((notification) => !notification.isViewed);
            if (unread) return true;
        }
        return false;
    }, [aggregations]);

    return (
        <Indicator position={"top-end"} processing disabled={!hasUnreadNotifications}>
            <IconBell />
        </Indicator>
    );
};

export default NotificationsIcon;
