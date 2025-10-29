import React from "react";
import { useLatestActivities } from "#@/components/activity/hooks/useLatestActivities";
import { Stack } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { ActivityItem, ActivityItemProps } from "#@/components";

interface Props extends Omit<ActivityItemProps, "activity"> {
  userId?: string;
  limit?: number;
  offset?: number;
}

const RecentActivityList = ({
  userId,
  offset = 0,
  limit = 5,
  ...others
}: Props) => {
  const activitiesQuery = useLatestActivities(userId, offset, limit);
  const isEmpty =
    !activitiesQuery.isLoading &&
    activitiesQuery.isSuccess &&
    (activitiesQuery.data == undefined ||
      activitiesQuery.data.data.length === 0);

  return (
    <Stack className={"w-full h-full"}>
      {activitiesQuery.isLoading && <CenteredLoading />}
      {activitiesQuery.data?.data?.map((activity) => {
        return (
          <ActivityItem key={activity.id} activity={activity} {...others} />
        );
      })}
      {isEmpty && (
        <CenteredErrorMessage message={"No recent activity to show."} />
      )}
    </Stack>
  );
};

export { RecentActivityList };
