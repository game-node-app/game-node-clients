import React from "react";
import { Box, Stack } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import {
  ActivityFeed,
  ActivityFeedLayout,
  InfiniteLoaderProps,
  SimpleInfiniteLoader,
} from "@repo/ui";

const Following = () => {
  return (
    <SessionAuth>
      <Stack className={"w-full items-center"}>
        <Box className={"w-full lg:w-8/12"}>
          <ActivityFeedLayout currentTab={"following"} onChange={() => {}}>
            <ActivityFeed criteria={"following"}>
              {(props: InfiniteLoaderProps) => (
                <SimpleInfiniteLoader {...props} />
              )}
            </ActivityFeed>
          </ActivityFeedLayout>
        </Box>
      </Stack>
    </SessionAuth>
  );
};

export default Following;
