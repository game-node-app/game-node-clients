import React, { PropsWithChildren } from "react";
import { Box, Divider, Stack, Tabs } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";
import Link from "next/link";

interface Props extends PropsWithChildren {
    currentTab: "following" | "all";
}

const ActivityFeedLayout = ({ children, currentTab }: Props) => {
    const userId = useUserId();
    return (
        <Stack className={"w-full h-full"}>
            <Tabs value={currentTab}>
                <Tabs.List>
                    <Link href={"/activity/following"}>
                        <Tabs.Tab
                            value={"following"}
                            disabled={userId == undefined}
                        >
                            Following
                        </Tabs.Tab>
                    </Link>
                    <Link href={"/activity/all"}>
                        <Tabs.Tab value={"all"}>All</Tabs.Tab>
                    </Link>
                </Tabs.List>
            </Tabs>
            <Box>{children}</Box>
        </Stack>
    );
};

export default ActivityFeedLayout;
