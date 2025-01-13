import { useMemo } from "react";
import { AggregatedNotificationContentProps } from "@/components/notifications/AggregatedNotification";
import { useReview } from "@/components/review/hooks/useReview";
import { NotificationAggregateDto } from "@/wrapper/server";
import getUniqueProfileNames from "@/components/notifications/utils/getUniqueProfileNames";
import { Group, Text } from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import Link from "next/link";
import { useGame } from "@/components/game/hooks/useGame";
import NotificationSkeleton from "@/components/notifications/NotificationSkeleton";
import category = NotificationAggregateDto.category;
import sourceType = NotificationAggregateDto.sourceType;

const ReviewAggregatedNotification = ({
    aggregatedNotification,
}: AggregatedNotificationContentProps) => {
    const reviewQuery = useReview(aggregatedNotification.sourceId as string);
    const gameQuery = useGame(reviewQuery.data?.gameId, {});

    const profileNames = useMemo(() => {
        return getUniqueProfileNames(aggregatedNotification.notifications);
    }, [aggregatedNotification.notifications]);

    const latestNotification = aggregatedNotification.notifications[0];
    const latestNotificationUserId = latestNotification.profileUserId;
    const latestProfileNames = profileNames.slice(0, 2).join(", ");
    const hasMoreProfileNames = profileNames.length > 2;
    const gameName = gameQuery.data?.name;

    const actionText = useMemo(() => {
        switch (aggregatedNotification.category) {
            case category.LIKE:
                return "liked your review";
            case category.COMMENT:
                return "commented on your review";
            case category.MENTION:
                return "mentioned you in a review";
        }
    }, [aggregatedNotification.category]);

    if (reviewQuery.isLoading || gameQuery.isLoading) {
        return <NotificationSkeleton />;
    }

    return (
        <Link href={`/game/${reviewQuery.data?.gameId}`} className={"w-full"}>
            <Group wrap={"nowrap"} className={"w-full"}>
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
                    {actionText}
                    {gameName && (
                        <>
                            {" "}
                            of <strong>{gameName}</strong>
                        </>
                    )}
                    .
                </Text>
            </Group>
        </Link>
    );
};

export default ReviewAggregatedNotification;
