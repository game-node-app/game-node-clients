import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { useComment } from "@/components/comment/hooks/useComment";
import {
    ActivityComment,
    FindAllCommentsDto,
    NotificationAggregateDto,
    ReviewComment,
} from "@/wrapper/server";
import getUniqueProfileNames from "@/components/notifications/utils/getUniqueProfileNames";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";
import Link from "next/link";
import { Group, Text } from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import category = NotificationAggregateDto.category;
import { useReview } from "@/components/review/hooks/useReview";
import useUserId from "@/components/auth/hooks/useUserId";

const ReviewCommentAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const userId = useUserId();
    const commentQuery = useComment<ReviewComment>(
        aggregatedNotification.sourceId as string,
        FindAllCommentsDto.sourceType.REVIEW,
    );
    const reviewQuery = useReview(commentQuery.data?.reviewId);

    const profileNames = useMemo(() => {
        return getUniqueProfileNames(aggregatedNotification.notifications);
    }, [aggregatedNotification.notifications]);

    const latestNotification = aggregatedNotification.notifications[0];
    const latestNotificationUserId = latestNotification.profileUserId;
    const latestProfileNames = profileNames.slice(0, 2).join(", ");
    const hasMoreProfileNames = profileNames.length > 2;

    const isOwnReview = useMemo(() => {
        return (
            reviewQuery.data != undefined &&
            reviewQuery.data.profileUserId === userId
        );
    }, [reviewQuery.data, userId]);

    const actionText = useMemo(() => {
        switch (aggregatedNotification.category) {
            case category.LIKE:
                return `liked your comment in ${isOwnReview ? "your" : "an"} review`;
            case category.COMMENT:
                return `responded to your comment in ${isOwnReview ? "your" : "an"} review`;
        }
    }, [aggregatedNotification.category, isOwnReview]);

    const href = useMemo(() => {
        if (isOwnReview) {
            return `/game/${reviewQuery.data?.gameId}`;
        }

        return `/game/${reviewQuery.data?.gameId}?reviewId=${reviewQuery.data?.id}`;
    }, [isOwnReview, reviewQuery.data?.gameId, reviewQuery.data?.id]);

    if (commentQuery.isLoading || reviewQuery.isLoading) {
        return <NotificationSkeleton />;
    } else if (commentQuery.data == undefined) {
        return null;
    }
    return (
        <Link href={href}>
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

export default ReviewCommentAggregatedNotification;
