import React, { useMemo } from "react";
import {
  AggregatedNotificationContentProps,
  useNotificationContent,
} from "#@/components";
import { NotificationAggregateDto } from "@repo/wrapper/server";
import { Link } from "#@/util";
import category = NotificationAggregateDto.category;

const PostAggregatedNotification = ({
  aggregatedNotification,
}: AggregatedNotificationContentProps) => {
  const actionText = useMemo(() => {
    switch (aggregatedNotification.category) {
      case category.LIKE:
        return `liked your post`;
      case category.COMMENT:
        return `commented in your post`;
    }
  }, [aggregatedNotification.category]);

  const content = useNotificationContent({
    aggregatedNotification,
    actionText,
  });

  return (
    <Link
      href={`/posts?postId=${aggregatedNotification.sourceId}`}
      className={"w-full h-full"}
    >
      {content}
    </Link>
  );
};

export { PostAggregatedNotification };
