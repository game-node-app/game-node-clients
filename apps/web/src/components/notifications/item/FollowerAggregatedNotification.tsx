import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { Group, Text } from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import Link from "next/link";

const FollowerAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    return useMemo(() => {
        if (
            !aggregatedNotification ||
            aggregatedNotification.notifications.length === 0
        ) {
            return null;
        }
        const followerProfile = aggregatedNotification.notifications[0].profile;
        const followerUserId =
            aggregatedNotification.notifications[0].profileUserId;
        return (
            <Link href={`/profile/${followerUserId}`} className={"w-full"}>
                <Group>
                    {followerUserId && <UserAvatar userId={followerUserId} />}
                    <Text>
                        <strong>{followerProfile?.username}</strong> has started
                        following you.
                    </Text>
                </Group>
            </Link>
        );
    }, [aggregatedNotification]);
};

export default FollowerAggregatedNotification;
