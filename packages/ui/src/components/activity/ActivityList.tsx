import React from "react";
import { Activity } from "@repo/wrapper/server";
import { ActivityItem, ActivityItemProps } from "#@/components";

interface Props {
  items: Activity[] | undefined;
  withUserAvatar?: boolean;
  Component?: React.ComponentType<ActivityItemProps>;
}

const ActivityList = ({
  items,
  withUserAvatar = true,
  Component = ActivityItem,
}: Props) => {
  if (!items) return null;
  return items.map((activity) => {
    return (
      <Component
        key={activity.id}
        activity={activity}
        withUserAvatar={withUserAvatar}
      ></Component>
    );
  });
};

export { ActivityList };
