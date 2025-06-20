import React from "react";
import { Activity } from "../../../../wrapper/src/server";
import { ReviewActivityItem } from "#@/components/activity/item/ReviewActivityItem";
import { CollectionEntryActivityItem } from "#@/components/activity/item/CollectionEntryActivityItem";
import { UserFollowActivityItem } from "#@/components/activity/item/UserFollowActivityItem";
import type = Activity.type;
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
