import React from "react";
import { useLatestActivities } from "#@/components/activity/hooks/useLatestActivities";
import { Stack } from "@mantine/core";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { ActivityList } from "#@/components";

interface Props {
  userId?: string;
  limit?: number;
  offset?: number;
  withUserAvatar?: boolean;
}

const RecentActivityList = ({
  userId,
  withUserAvatar = true,
  offset = 0,
  limit = 5,
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
      {activitiesQuery.data && (
        <ActivityList
          items={activitiesQuery.data.data}
          withUserAvatar={withUserAvatar}
        />
      )}
      {isEmpty && (
        <CenteredErrorMessage message={"No recent activity to show."} />
      )}
    </Stack>
  );
};

export { RecentActivityList };
