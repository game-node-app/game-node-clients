import { useUserId } from "#@/components";
import { Box, Stack, Tabs } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { PropsWithChildren } from "react";

export type PostsFeedTabValue = "following" | "all" | "mine";

interface Props extends PropsWithChildren {
  currentTab: PostsFeedTabValue;
  onChange: (value: PostsFeedTabValue) => void;
}

const PostsFeedLayout = ({ currentTab, onChange, children }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();

  return (
    <Stack className={"w-full h-full"}>
      <Tabs
        value={currentTab}
        onChange={(value) => value && onChange(value as PostsFeedTabValue)}
      >
        <Tabs.List grow>
          <Tabs.Tab value={"all"}>{t("activity.tabs.all")}</Tabs.Tab>
          {userId && (
            <Tabs.Tab value={"following"}>
              {t("activity.tabs.following")}
            </Tabs.Tab>
          )}
          {userId && <Tabs.Tab value={"mine"}>{t("posts.tabs.mine")}</Tabs.Tab>}
        </Tabs.List>
      </Tabs>
      <Box>{children}</Box>
    </Stack>
  );
};

export { PostsFeedLayout };
