import React from "react";
import { Activity } from "@repo/wrapper/server";
import { ActivityItem, ActivityItemProps } from "#@/components";

interface Props extends Omit<ActivityItemProps, "activity"> {
  items: Activity[] | undefined;
}

const ActivityList = ({ items, ...others }: Props) => {
  if (!items) return null;
  return items.map((activity) => {
    return <ActivityItem key={activity.id} activity={activity} {...others} />;
  });
};

export { ActivityList };
