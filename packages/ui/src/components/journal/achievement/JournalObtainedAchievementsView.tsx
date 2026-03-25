import React, { useState } from "react";
import {
  BackToTopButton,
  JournalAchievementsCompactLayoutView,
  JournalAchievementsYearGroupView,
  useJournalObtainedAchievements,
  useOnMobile,
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

interface Props {
  userId: string;
}

/**
 * Render a list of obtained achievements grouped by year and month, then by game.
 * @param userId
 * @constructor
 */
const JournalObtainedAchievementsView = ({ userId }: Props) => {
  const onMobile = useOnMobile();
  const ownUserId = useUserId();
  const isOwnJournal = ownUserId === userId;
  const [layout, setLayout] = useState<"compact" | "detailed">("compact");
  const { data: achievementGroups } = useJournalObtainedAchievements(userId);

  const renderedLayout =
    layout === "compact" ? (
      <JournalAchievementsCompactLayoutView
        userId={userId}
        groups={achievementGroups?.years || []}
      />
    ) : (
      achievementGroups?.years.map((yearGroup) => (
        <JournalAchievementsYearGroupView
          key={`${userId}_${yearGroup.year}`}
          userId={userId}
          yearGroup={yearGroup}
        />
      ))
    );

  return (
    <Stack className={"gap-1.5 h-full w-full"}>
      <BackToTopButton />
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
      {achievementGroups && renderedLayout}
    </Stack>
  );
};

export { JournalObtainedAchievementsView };
