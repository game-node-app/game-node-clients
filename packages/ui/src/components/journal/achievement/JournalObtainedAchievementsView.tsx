import React, { useMemo, useState } from "react";
import {
  BackToTopButton,
  CenteredLoading,
  JournalAchievementsCompactLayoutView,
  JournalAchievementsYearGroupView,
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
  IconLayoutColumns,
  IconLayoutList,
  IconQuestionMark,
} from "@tabler/icons-react";
import { cn } from "#@/util";
import { JournalAchievementsDetailedLayoutView } from "#@/components/journal/achievement/JournalAchievementsDetailedLayoutView";

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
                This section of the journal is dedicated to showcasing the
                achievements you&#39;ve obtained in the games you play. It&#39;s
                a way to celebrate your gaming milestones and share your
                accomplishments with the community.
              </Text>
              <Text className={"text-sm text-dimmed text-wrap"}>
                This information is automatically updated periodically* from the
                gaming platforms you connect to your GameNode profile, such as
                Steam, Xbox and PlayStation.
              </Text>
              <Text className={"text-dimmed text-sm"}>
                *The update frequency may vary based on the platform and its API
                limitations.
              </Text>
            </Box>
          </Popover.Dropdown>
        </Popover>
        <Group wrap={"nowrap"} gap={"xs"}>
          <Tooltip label={"Compact View"} position={"bottom"}>
            <ActionIcon
              size={"md"}
              onClick={() => setLayout("compact")}
              variant={layout === "compact" ? "filled" : "outline"}
            >
              <IconLayoutColumns />
            </ActionIcon>
          </Tooltip>
          <Divider orientation={"vertical"} />
          <Tooltip label={"Detailed View"} position={"bottom"}>
            <ActionIcon
              size={"md"}
              onClick={() => setLayout("detailed")}
              variant={layout === "detailed" ? "filled" : "outline"}
            >
              <IconLayoutList />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
      <Text className={"text-start text-sm text-dimmed"}>
        Tip: {onMobile ? "Tap" : "Hover"} the achievements to show details.
        Latest achievements are shown first.
      </Text>
      {isLoading && <CenteredLoading message={"Loading achievements..."} />}
      {renderedLayout}
    </Stack>
  );
};

export { JournalObtainedAchievementsView };
