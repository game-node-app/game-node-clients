import React from "react";
import { Box, Stack } from "@mantine/core";
import { SessionAuth } from "@repo/ui";
import {
  ActivityFeed,
  ActivityFeedLayout,
  InfiniteLoaderProps,
  SimpleInfiniteLoader,
} from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

const Following = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SessionAuth>
      <OpenGraph title={t("seo.feed.title")} noIndex />
      <Stack className={"w-full items-center"}>
        <Box className={"w-full"}>
          <ActivityFeedLayout
            currentTab={"following"}
            onChange={(tab) => {
              router.push(`/activity/${tab}`);
            }}
          >
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
