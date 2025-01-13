import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FollowInfoRequestDto, PaginationInfo } from "@/wrapper/server";
import { Divider, Group, Skeleton, Stack, Text } from "@mantine/core";
import { useInfiniteFollowInfo } from "@/components/follow/hooks/useInfiniteFollowInfo";
import UserFollowGroup from "@/components/follow/input/UserFollowGroup";
import { useIntersection } from "@mantine/hooks";
import { TBasePaginationRequest } from "@/util/types/pagination";

interface Props {
    criteria: FollowInfoRequestDto.criteria;
    targetUserId: string;
}

const FollowInfoList = ({ criteria, targetUserId }: Props) => {
    const { entry, ref } = useIntersection({
        threshold: 1,
        root: document.getElementById(`${criteria}-intersection-root`),
    });

    const { data, fetchNextPage, isLoading, isFetching, isError } =
        useInfiniteFollowInfo({
            criteria,
            targetUserId,
            orderBy: {
                createdAt: "DESC",
            },
        });
    const items = useMemo(() => {
        if (data == undefined) return null;
        const userIds = data.pages.flatMap((response) => {
            return response.data;
        });
        return userIds.map((userId) => {
            return <UserFollowGroup key={userId} userId={userId} mb={"sm"} />;
        });
    }, [data]);

    const isEmpty = !isLoading && (items == undefined || items.length === 0);

    const buildItemsSkeletons = useCallback(() => {
        return new Array(5).fill(0).map((v, i) => {
            return (
                <Group key={i} mb={"sm"}>
                    <Skeleton className={"rounded-xl h-9 w-9"} />
                    <Skeleton className={"h-6 w-1/2"} />
                </Group>
            );
        });
    }, []);

    useEffect(() => {
        const minimumIntersectionTime = 3000;
        const lastElement = data?.pages[data?.pages.length - 1];
        const hasNextPage = lastElement?.pagination.hasNextPage ?? false;
        const canFetchNextPage =
            lastElement && hasNextPage && !isLoading && !isFetching && !isError;

        if (
            canFetchNextPage &&
            entry?.isIntersecting &&
            entry.time > minimumIntersectionTime
        ) {
            fetchNextPage().then();
        }
    }, [
        entry,
        isLoading,
        isFetching,
        isError,
        fetchNextPage,
        isEmpty,
        data?.pages,
    ]);

    return (
        <Stack w={"100%"} id={`${criteria}-intersection-root`}>
            {isEmpty && (
                <Text className={"text-center"} c={"red"}>
                    {criteria === "following"
                        ? "User is not following anyone."
                        : "User has no followers."}
                </Text>
            )}
            {items}
            {(isLoading || isFetching) && buildItemsSkeletons()}
            {!isEmpty && <div id={"last-element-tracker"} ref={ref} />}
        </Stack>
    );
};

export default FollowInfoList;
