import React, { PropsWithChildren } from "react";
import { useUserId } from "#@/components";
import { Box, Stack, Tabs } from "@mantine/core";

export type PostsFeedTabValue = "following" | "all";

interface Props extends PropsWithChildren {
  currentTab: PostsFeedTabValue;
  onChange: (value: PostsFeedTabValue) => void;
}

const PostsFeedLayout = ({ currentTab, onChange, children }: Props) => {
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
            disabled={true}
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

export { PostsFeedLayout };
