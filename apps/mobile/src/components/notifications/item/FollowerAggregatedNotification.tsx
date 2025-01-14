import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { Group, Notification, Text } from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import useUserId from "@/components/auth/hooks/useUserId";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

const FollowerAggregatedNotification = ({ aggregatedNotification }: AggregatedNotificationContentProps) => {
    const ownUserId = useUserId();
    const content = useMemo(() => {
        if (!aggregatedNotification || aggregatedNotification.notifications.length === 0) {
            return null;
        }
        const followerProfile = aggregatedNotification.notifications[0].profile;
        const followerUserId = aggregatedNotification.notifications[0].profileUserId;
        return (
            <Link to={getTabAwareHref(`/profile/${followerUserId}`)} className={"w-full"}>
                <Group>
                    {followerUserId && <UserAvatar userId={followerUserId} />}
                    <Text>
                        <strong>{followerProfile?.username}</strong> has started following you.
                    </Text>
                </Group>
            </Link>
        );
    }, [aggregatedNotification]);

    return content;
};

export default FollowerAggregatedNotification;
