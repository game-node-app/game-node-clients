import React, { useCallback, useMemo } from "react";
import { useInfiniteActivities } from "#@/components/activity/hooks/useInfiniteActivities";
import { Skeleton, Stack } from "@mantine/core";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { ActivityList } from "#@/components/activity/ActivityList";
import { ActivityFeedTabValue } from "#@/components/activity/ActivityFeedLayout";

interface Props {
  criteria: ActivityFeedTabValue;
}

const ActivityFeed = ({ criteria }: Props) => {
  const activityQuery = useInfiniteActivities({
    criteria,
    limit: 10,
  });

  const items = useMemo(() => {
    if (!activityQuery.data) return undefined;
    return activityQuery.data.pages?.flatMap((page) => page.data);
  }, [activityQuery.data]);

  const isLoading = activityQuery.isLoading;
  const isError = activityQuery.isError;

  const isEmpty =
    activityQuery.data != undefined &&
    activityQuery.data?.pages.some((page) => {
      return page.pagination.totalItems === 0;
    });

  const buildSkeletons = useCallback(() => {
    return new Array(4).fill(0).map((_, i) => {
      return <Skeleton key={i} className={"w-full h-[140px]"} />;
    });
  }, []);

  return (
    <Stack className={"w-full h-full"}>
      {activityQuery.isLoading && buildSkeletons()}
      {!isLoading && isEmpty && (
        <CenteredErrorMessage
          message={"No activities to show. Try a different filter."}
        />
      )}
      {isError && (
        <CenteredErrorMessage
          message={
            "Error while fetching activities. Please try again or contact support."
          }
        />
      )}
      <ActivityList items={items} />
      {activityQuery.isFetching && buildSkeletons()}
    </Stack>
  );
};

export { ActivityFeed };
