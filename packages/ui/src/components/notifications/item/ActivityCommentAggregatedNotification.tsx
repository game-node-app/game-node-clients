import React, { useMemo } from "react";
import { AggregatedNotificationContentProps } from "#@/components/notifications/AggregatedNotification";
import { useComment } from "#@/components/comment/hooks/useComment";
import {
  ActivityComment,
  FindAllCommentsDto,
  NotificationAggregateDto,
} from "@repo/wrapper/server";
import { NotificationSkeleton } from "#@/components/notifications/NotificationSkeleton";
import { Link } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useActivity } from "#@/components/activity/hooks/useActivity";
import { useNotificationContent } from "#@/components";
import category = NotificationAggregateDto.category;

const ActivityCommentAggregatedNotification = ({
  aggregatedNotification,
}: AggregatedNotificationContentProps) => {
  const userId = useUserId();
  const commentQuery = useComment<ActivityComment>(
    aggregatedNotification.sourceId as string,
    FindAllCommentsDto.sourceType.ACTIVITY,
  );

  const activityQuery = useActivity(commentQuery.data?.activityId);

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

  const content = useNotificationContent({
    aggregatedNotification,
    actionText,
  });

  if (commentQuery.isLoading || activityQuery.isLoading) {
    return <NotificationSkeleton />;
  } else if (commentQuery.data == undefined) {
    return null;
  }
  return (
    <Link href={`/activity/detail/${commentQuery.data.activityId}`}>
      {content}
    </Link>
  );
};

export { ActivityCommentAggregatedNotification };
