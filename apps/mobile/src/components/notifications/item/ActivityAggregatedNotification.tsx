import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { Group, Text } from "@mantine/core";
import getUniqueProfileNames from "@/components/notifications/utils/getUniqueProfileNames";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

const ActivityAggregatedNotification = ({ aggregatedNotification }: AggregatedNotificationContentProps) => {
    const profileNames = useMemo(() => {
        return getUniqueProfileNames(aggregatedNotification.notifications);
    }, [aggregatedNotification.notifications]);

    const latestNotification = aggregatedNotification.notifications[0];
    const latestNotificationUserId = latestNotification.profileUserId;
    const latestProfileNames = profileNames.slice(0, 2).join(", ");
    const hasMoreProfileNames = profileNames.length > 2;

    return (
        <Link to={getTabAwareHref(`/activity/detail/${aggregatedNotification.sourceId}`)}>
            <Group className={"w-full flex-nowrap"}>
                {latestNotificationUserId && <UserAvatar userId={latestNotificationUserId} />}
                <Text lineClamp={4}>
                    <strong>{latestProfileNames}</strong>{" "}
                    {hasMoreProfileNames && <>and {profileNames.length - 2} others</>} liked your activity.
                </Text>
            </Group>
        </Link>
    );
};

export default ActivityAggregatedNotification;
