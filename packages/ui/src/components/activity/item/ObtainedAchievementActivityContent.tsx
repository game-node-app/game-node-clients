import React, { useCallback, useMemo } from "react";
import { GameObtainedAchievementActivityDto } from "@repo/wrapper/server";
import {
  Box,
  Group,
  HoverCard,
  Popover,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
import {
  GameAchievementHoverIcon,
  GameAchievementsListItem,
  TextLink,
  useGame,
  useOnMobile,
} from "#@/components";

interface Props {
  activity: GameObtainedAchievementActivityDto | undefined;
}

const ObtainedAchievementActivityContent = ({ activity }: Props) => {
  const onMobile = useOnMobile();

  const PopoverElement = onMobile ? Popover : HoverCard;

  const gameId = activity?.externalGame.gameId;

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
    },
  });

  const renderedText = useMemo(() => {
    if (activity == undefined) return "";

    const totalObtained = activity.totalObtained || 0;
    const hasCompleted = activity.hasCompletedAllAchievements || false;
    const hasPlatinum = activity.hasObtainedPlatinumTrophy || false;

    if (hasCompleted && hasPlatinum) {
      return `Obtained platinum trophy and completed all achievements`;
    } else if (hasCompleted) {
      return `Completed all achievements`;
    } else if (hasPlatinum) {
      return `Obtained platinum trophy`;
    } else {
      return `Obtained ${totalObtained} achievement${totalObtained > 1 ? "s" : ""}`;
    }
  }, [activity]);

  if (!activity) {
    return <></>;
  }

  return (
    <PopoverElement withArrow>
      <PopoverElement.Target>
        <Text span className={"text-xs font-bold"}>
          {renderedText}
        </Text>
      </PopoverElement.Target>
      <PopoverElement.Dropdown className={"max-w-[95vw] md:max-w-sm"}>
        <Stack>
          <SimpleGrid className={"w-full gap-1 gap-y-2"} cols={6}>
            {activity.obtainedGameAchievements.map((obtainedAchievement) => (
              <GameAchievementHoverIcon
                key={obtainedAchievement.externalId}
                achievement={obtainedAchievement}
              />
            ))}
          </SimpleGrid>
          <TextLink
            href={`/profile/${activity.profileUserId}?tab=achievements`}
            className={"mt-2"}
          >
            See more
          </TextLink>
        </Stack>
      </PopoverElement.Dropdown>
    </PopoverElement>
  );
};

export { ObtainedAchievementActivityContent };
