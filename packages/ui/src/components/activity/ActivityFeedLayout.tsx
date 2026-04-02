import React, { PropsWithChildren } from "react";
import { Box, Divider, Stack, Tabs } from "@mantine/core";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { Link } from "#@/util";
import { useTranslation } from "@repo/locales";

export type ActivityFeedTabValue = "following" | "all";

interface Props extends PropsWithChildren {
  currentTab: ActivityFeedTabValue;
  onChange: (value: ActivityFeedTabValue) => void;
}

const ActivityFeedLayout = ({ children, currentTab, onChange }: Props) => {
  const { t } = useTranslation();
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
            {t("activity.tabs.all")}
          </Tabs.Tab>
          <Tabs.Tab
            value={"following"}
            disabled={userId == undefined}
            onClick={() => {
              onChange("following");
            }}
          >
            {t("activity.tabs.following")}
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Box>{children}</Box>
    </Stack>
  );
};

export { ActivityFeedLayout };
