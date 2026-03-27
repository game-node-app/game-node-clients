import React, { useCallback } from "react";
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

  const renderConditionalFlavorText = useCallback(() => {
    if (activity?.hasObtainedPlatinumTrophy) {
      return (
        <Text span>
          {" "}
          and the{" "}
          <Text span className={"font-bold"}>
            Platinum trophy
          </Text>
        </Text>
      );
    }

    if (activity?.hasCompletedAllAchievements) {
      return (
        <Text span>
          {" "}
          and the{" "}
          <Text span className={"font-bold"}>
            100%
          </Text>
        </Text>
      );
    }

    return null;
  }, [
    activity?.hasObtainedPlatinumTrophy,
    activity?.hasCompletedAllAchievements,
  ]);

  if (!activity) {
    return <></>;
  }

  return (
    <>
      <Text span>obtained </Text>
      <PopoverElement openDelay={500} closeDelay={300}>
        <PopoverElement.Target>
          <Text span className={"font-bold cursor-pointer text-white"}>
            {activity.totalObtained} achievements
          </Text>
        </PopoverElement.Target>
        <PopoverElement.Dropdown className={"max-w-[95vw] lg:max-w-[60vw]"}>
          <Stack>
            <Group className={"gap-1"}>
              {activity.obtainedGameAchievements.map((obtainedAchievement) => (
                <GameAchievementHoverIcon
                  key={obtainedAchievement.externalId}
                  achievement={obtainedAchievement}
                />
              ))}
            </Group>
            <TextLink
              href={`/profile/${activity.profileUserId}?tab=achievements`}
              className={"mt-2"}
            >
              See more
            </TextLink>
          </Stack>
        </PopoverElement.Dropdown>
      </PopoverElement>
      {renderConditionalFlavorText()}
      <Text span> in </Text>
      <TextLink
        href={`/game/${gameId}`}
        className={"font-bold text-white no-underline"}
      >
        {gameQuery.data?.name}
      </TextLink>
    </>
  );
};

export { ObtainedAchievementActivityContent };
