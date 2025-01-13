import React from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Box, Container, Stack, Text } from "@mantine/core";
import ActivityFeedLayout from "@/components/activity/ActivityFeedLayout";
import ActivityFeed from "@/components/activity/ActivityFeed";

const Following = () => {
    return (
        <SessionAuth>
            <Stack className={"w-full items-center"}>
                <Box className={"w-full lg:w-8/12"}>
                    <ActivityFeedLayout currentTab={"following"}>
                        <ActivityFeed criteria={"following"} />
                    </ActivityFeedLayout>
                </Box>
            </Stack>
        </SessionAuth>
    );
};

export default Following;
