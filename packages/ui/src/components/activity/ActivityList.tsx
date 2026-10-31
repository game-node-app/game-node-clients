import { ActivityItem, ActivityItemProps } from "#@/components";
import { Activity } from "@repo/wrapper/server";

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