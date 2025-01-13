import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { useComment } from "@/components/comment/hooks/useComment";
import {
    ActivityComment,
    FindAllCommentsDto,
    Notification,
    NotificationAggregateDto,
} from "@/wrapper/server";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";
import getUniqueProfileNames from "@/components/notifications/utils/getUniqueProfileNames";
import category = NotificationAggregateDto.category;
import { Group, Text } from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import Link from "next/link";
import useUserId from "@/components/auth/hooks/useUserId";
import { useActivity } from "@/components/activity/hooks/useActivity";

const ActivityCommentAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const userId = useUserId();
    const commentQuery = useComment<ActivityComment>(
        aggregatedNotification.sourceId as string,
        FindAllCommentsDto.sourceType.ACTIVITY,
    );

    const activityQuery = useActivity(commentQuery.data?.activityId);

    const profileNames = useMemo(() => {
        return getUniqueProfileNames(aggregatedNotification.notifications);
    }, [aggregatedNotification.notifications]);

    const latestNotification = aggregatedNotification.notifications[0];
    const latestNotificationUserId = latestNotification.profileUserId;
    const latestProfileNames = profileNames.slice(0, 2).join(", ");
    const hasMoreProfileNames = profileNames.length > 2;

    const isOwnActivity = useMemo(() => {
        return (
            activityQuery.data != undefined &&
            activityQuery.data.profileUserId === userId
        );
    }, [activityQuery.data, userId]);

    const actionText = useMemo(() => {
        switch (aggregatedNotification.category) {
            case category.LIKE:
                return `liked your comment in ${isOwnActivity ? "your" : "an"} activity`;
            case category.COMMENT:
                return `responded to your comment in ${isOwnActivity ? "your" : "an"} activity`;
        }
    }, [aggregatedNotification.category, isOwnActivity]);

    if (commentQuery.isLoading || activityQuery.isLoading) {
        return <NotificationSkeleton />;
    } else if (commentQuery.data == undefined) {
        return null;
    }
    return (
        <Link href={`/activity/detail/${commentQuery.data.activityId}`}>
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

export default ActivityCommentAggregatedNotification;
