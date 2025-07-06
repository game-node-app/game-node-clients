import React from "react";
import { Box, Stack } from "@mantine/core";
import {
  ActivityFeed,
  ActivityFeedLayout,
  InfiniteLoaderProps,
  SimpleInfiniteLoader,
} from "@repo/ui";
import { useRouter } from "next/router";

const All = () => {
  const router = useRouter();

  return (
    <Stack className={"w-full items-center"}>
      <Box className={"w-full lg:w-8/12"}>
        <ActivityFeedLayout
          currentTab={"all"}
          onChange={(tab) => {
            router.push(`/activity/${tab}`);
          }}
        >
          <ActivityFeed criteria={"all"}>
            {(props: InfiniteLoaderProps) => (
              <SimpleInfiniteLoader {...props} />
            )}
          </ActivityFeed>
        </ActivityFeedLayout>
      </Box>
    </Stack>
  );
};

export default All;
