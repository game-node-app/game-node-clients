import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { Group, Text } from "@mantine/core";
import getUniqueProfileNames from "@/components/notifications/utils/getUniqueProfileNames";
import Link from "next/link";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import { Notification, NotificationAggregateDto } from "@/wrapper/server";
import category = Notification.category;

const ActivityAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const profileNames = useMemo(() => {
        return getUniqueProfileNames(aggregatedNotification.notifications);
    }, [aggregatedNotification.notifications]);

    const latestNotification = aggregatedNotification.notifications[0];
    const latestNotificationUserId = latestNotification.profileUserId;
    const latestProfileNames = profileNames.slice(0, 2).join(", ");
    const hasMoreProfileNames = profileNames.length > 2;

    const actionText = useMemo(() => {
        switch (aggregatedNotification.category) {
            case category.LIKE:
                return "liked your activity";
            case category.COMMENT:
                return "commented in your activity";
        }
    }, [aggregatedNotification.category]);

    return (
        <Link href={`/activity/detail/${aggregatedNotification.sourceId}`}>
            <Group className={"w-full flex-nowrap"}>
                {latestNotificationUserId && (
                    <UserAvatar userId={latestNotificationUserId} />
                )}
                <Text lineClamp={4}>
                    <strong>{latestProfileNames}</strong>{" "}
                    {hasMoreProfileNames && (
                        <>
                            and{" "}
                            {profileNames.length - latestProfileNames.length}{" "}
                            others
                        </>
                    )}{" "}
                    {actionText}.
                </Text>
            </Group>
        </Link>
    );
};

export default ActivityAggregatedNotification;
