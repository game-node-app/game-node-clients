import React, { useCallback, useEffect, useMemo } from "react";
import { useInfiniteActivities } from "@/components/activity/hooks/useInfiniteActivities";
import { Skeleton, Stack } from "@mantine/core";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import { useIntersection } from "@mantine/hooks";
import ActivityList from "@/components/activity/ActivityList";

interface Props {
    criteria: "following" | "all";
}

const ActivityFeed = ({ criteria }: Props) => {
    const { ref, entry } = useIntersection({
        threshold: 1,
    });
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
    const isSuccess = activityQuery.isSuccess;
    const isFetching = activityQuery.isFetching;

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

    useEffect(() => {
        const lastElement =
            activityQuery.data?.pages[activityQuery.data?.pages.length - 1];
        const hasNextPage =
            lastElement != undefined &&
            lastElement.data.length > 0 &&
            lastElement.pagination.hasNextPage;

        const canFetchNextPage = !isFetching && !isLoading && hasNextPage;

        // Minimum amount of time (ms) since document creation for
        // intersection to be considered valid
        const minimumIntersectionTime = 3000;

        if (
            canFetchNextPage &&
            entry?.isIntersecting &&
            entry.time > minimumIntersectionTime
        ) {
            activityQuery.fetchNextPage({ cancelRefetch: false });
        }
    }, [activityQuery, entry, isFetching, isLoading]);

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
            <div ref={ref} id={"last-element-tracker"}></div>
        </Stack>
    );
};

export default ActivityFeed;
