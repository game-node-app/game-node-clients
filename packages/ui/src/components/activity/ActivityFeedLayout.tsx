import { useUserId } from "#@/components/auth/hooks/useUserId";
import { Box, Stack, Tabs } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { PropsWithChildren } from "react";

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