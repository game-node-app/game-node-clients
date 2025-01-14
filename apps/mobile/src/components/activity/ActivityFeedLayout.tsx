import React, { PropsWithChildren } from "react";
import { Box, Divider, Stack, Tabs } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";

export type ActivityFeedTabValue = "following" | "all";

interface Props extends PropsWithChildren {
    currentTab: ActivityFeedTabValue;
    onChange: (value: ActivityFeedTabValue) => void;
}

const ActivityFeedLayout = ({ children, currentTab, onChange }: Props) => {
    const userId = useUserId();
    return (
        <Stack className={"w-full h-full"}>
            <Tabs value={currentTab}>
                <Tabs.List grow>
                    <Tabs.Tab
                        value={"all"}
                        onClick={() => {
                            onChange("all");
                        }}
                    >
                        All
                    </Tabs.Tab>
                    <Tabs.Tab
                        value={"following"}
                        disabled={userId == undefined}
                        onClick={() => {
                            onChange("following");
                        }}
                    >
                        Following
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
            <Box>{children}</Box>
        </Stack>
    );
};

export default ActivityFeedLayout;
