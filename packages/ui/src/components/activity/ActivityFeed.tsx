import React, { useCallback, useMemo } from "react";
import { Skeleton, Stack } from "@mantine/core";
import {
  ActivityFeedTabValue,
  ActivityItem,
  ActivityItemProps,
  ActivityList,
  CenteredErrorMessage,
  InfiniteLoaderChildren,
  useInfiniteActivities,
} from "#@/components";

interface Props {
  criteria: ActivityFeedTabValue;
  children: InfiniteLoaderChildren;
  Component?: React.ComponentType<ActivityItemProps>;
}

const ActivityFeed = ({
  criteria,
  children,
  Component = ActivityItem,
}: Props) => {
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
    <Stack className={"w-full h-full gap-xs"}>
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

      <ActivityList items={items} Component={Component} />

      {children({
        fetchNextPage: async () => {
          await activityQuery.fetchNextPage();
        },
        isFetching: activityQuery.isFetching,
        hasNextPage: activityQuery.hasNextPage,
      })}
    </Stack>
  );
};

export { ActivityFeed };
