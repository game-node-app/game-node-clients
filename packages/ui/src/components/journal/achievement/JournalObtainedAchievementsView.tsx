import React, { useMemo, useState } from "react";
import {
  BackToTopButton,
  CenteredLoading,
  JournalAchievementsCompactLayoutView,
  useJournalObtainedAchievements,
  useOnMobile,
  UserAvatarWithLevelInfo,
  useUserId,
} from "#@/components";
import {
  ActionIcon,
  Box,
  Divider,
  Flex,
  Group,
  Popover,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBaselineDensityMedium,
  IconBaselineDensitySmall,
  IconQuestionMark,
} from "@tabler/icons-react";
import { cn } from "#@/util";
import { JournalAchievementsDetailedLayoutView } from "#@/components/journal/achievement/JournalAchievementsDetailedLayoutView";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  withUserInfo?: boolean;
}

/**
 * Render a list of obtained achievements grouped by year and month, then by game.
 * @param userId
 * @param withUserInfo
 * @constructor
 */
const JournalObtainedAchievementsView = ({
  userId,
  withUserInfo = false,
}: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const ownUserId = useUserId();
  const isOwnJournal = ownUserId === userId;
  const [layout, setLayout] = useState<"compact" | "detailed">("compact");
  const { data: achievementGroups, isLoading } =
    useJournalObtainedAchievements(userId);

  const renderedLayout = useMemo(() => {
    if (layout === "compact") {
      return (
        <JournalAchievementsCompactLayoutView
          userId={userId}
          groups={achievementGroups?.years || []}
        />
      );
    }

    return (
      <JournalAchievementsDetailedLayoutView
        userId={userId}
        groups={achievementGroups?.years || []}
      />
    );
  }, [achievementGroups?.years, layout, userId]);

  return (
    <Stack className={"gap-1.5 h-full w-full"}>
      <BackToTopButton />
      {withUserInfo && (
        <Flex>
          <UserAvatarWithLevelInfo userId={userId} />
        </Flex>
      )}
      <Flex className={"justify-between mb-2"}>
        <Popover position={"bottom"}>
          <Popover.Target>
            <ActionIcon className={cn(isOwnJournal ? "visible" : "invisible")}>
              <IconQuestionMark />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <Box className={"w-full max-w-60"}>
              <Text className={"text-wrap"}>
                {t("journal.achievements.description")}
              </Text>
              <Text className={"text-sm text-dimmed text-wrap"}>
                {t("journal.achievements.autoUpdate")}
              </Text>
              <Text className={"text-dimmed text-sm"}>
                {t("journal.achievements.updateNote")}
              </Text>
            </Box>
          </Popover.Dropdown>
        </Popover>
        <Group wrap={"nowrap"} gap={"xs"}>
          <Tooltip label={t("view.compact")} position={"bottom"}>
            <ActionIcon
              size={"md"}
              onClick={() => setLayout("compact")}
              variant={layout === "compact" ? "filled" : "outline"}
            >
              <IconBaselineDensitySmall />
            </ActionIcon>
          </Tooltip>
          <Divider orientation={"vertical"} />
          <Tooltip label={t("view.detailed")} position={"bottom"}>
            <ActionIcon
              size={"md"}
              onClick={() => setLayout("detailed")}
              variant={layout === "detailed" ? "filled" : "outline"}
            >
              <IconBaselineDensityMedium />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
      <Text className={"text-start text-sm text-dimmed"}>
        {t("journal.achievements.tipLabel")}
        {t("journal.achievements.tipAction", {
          action: onMobile
            ? t("journal.achievements.tap")
            : t("journal.achievements.hover"),
        })}
      </Text>
      {isLoading && (
        <CenteredLoading message={t("journal.achievements.loading")} />
      )}
      {renderedLayout}
    </Stack>
  );
};

export { JournalObtainedAchievementsView };
