import React from "react";
import { Activity } from "@repo/wrapper/server";
import { ActivityItem } from "#@/components";

interface Props {
  items: Activity[] | undefined;
  withUserAvatar?: boolean;
}

const ActivityList = ({ items, withUserAvatar = true }: Props) => {
  if (!items) return null;
  return items.map((activity) => {
    return (
      <ActivityItem
        key={activity.id}
        activity={activity}
        withUserAvatar={withUserAvatar}
      />
    );
  });
};

export { ActivityList };
