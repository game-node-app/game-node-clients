import React, { useMemo } from "react";
import {
  AggregatedNotificationContentProps,
  NotificationSkeleton,
  useComment,
  useNotificationContent,
  usePost,
  useUserId,
} from "#@/components";
import {
  FindAllCommentsDto,
  NotificationAggregateDto,
  PostComment,
} from "@repo/wrapper/server";
import { Link } from "#@/util";
import { UseQueryResult } from "@tanstack/react-query";
import category = NotificationAggregateDto.category;

const PostCommentAggregatedNotification = ({
  aggregatedNotification,
}: AggregatedNotificationContentProps) => {
  const userId = useUserId();
  const commentQuery: UseQueryResult<PostComment> = useComment(
    aggregatedNotification.sourceId as string,
    FindAllCommentsDto.sourceType.POST,
  );
  const postQuery = usePost(commentQuery.data?.postId);
  const isOwnPost = postQuery.data?.profileUserId === userId;

  const actionText = useMemo(() => {
    switch (aggregatedNotification.category) {
      case category.LIKE:
        return `liked your comment in ${isOwnPost ? "your" : "an"} post`;
      case category.COMMENT:
        return `responded to your comment in ${isOwnPost ? "your" : "an"} post`;
    }
  }, [aggregatedNotification.category, isOwnPost]);

  const content = useNotificationContent({
    aggregatedNotification,
    actionText,
  });

  if (postQuery.isLoading) {
    return <NotificationSkeleton />;
  } else if (postQuery.data == undefined) {
    return null;
  }

  return (
    <Link
      href={`/posts?postId=${aggregatedNotification.sourceId}`}
      className={"w-full"}
    >
      {content}
    </Link>
  );
};

export { PostCommentAggregatedNotification };
