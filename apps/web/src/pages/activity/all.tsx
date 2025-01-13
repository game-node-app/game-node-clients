import React from "react";
import ActivityFeedLayout from "@/components/activity/ActivityFeedLayout";
import { Box, Container, Paper, Stack, Text } from "@mantine/core";
import { useInfiniteActivities } from "@/components/activity/hooks/useInfiniteActivities";
import ActivityFeed from "@/components/activity/ActivityFeed";

const All = () => {
    const activities = useInfiniteActivities({
        limit: 10,
        criteria: "all",
    });
    return (
        <Stack className={"w-full items-center"}>
            <Box className={"w-full lg:w-8/12"}>
                <ActivityFeedLayout currentTab={"all"}>
                    <ActivityFeed criteria={"all"} />
                </ActivityFeedLayout>
            </Box>
        </Stack>
    );
};

export default All;
