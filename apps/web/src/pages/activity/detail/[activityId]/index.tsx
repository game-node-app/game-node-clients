import React from "react";
import { Box, Container, Stack } from "@mantine/core";
import ActivityDetailView from "@/components/activity/ActivityDetailView";
import { useRouter } from "next/router";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";

const ActivityDetailPage = () => {
    const router = useRouter();
    const { activityId } = router.query;

    if (!router.isReady) {
        return null;
    } else if (activityId == undefined) {
        return (
            <CenteredErrorMessage
                message={"No activity found. Please try again."}
            />
        );
    }

    return (
        <Stack mih={"100%"} pos={"relative"} className="items-center">
            <Box className={"w-full lg:w-8/12"}>
                <ActivityDetailView activityId={activityId as string} />
            </Box>
        </Stack>
    );
};

export default ActivityDetailPage;
