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
import { useTranslation } from "@repo/locales";

interface Props {
  activity: GameObtainedAchievementActivityDto | undefined;
}

const ObtainedAchievementActivityContent = ({ activity }: Props) => {
  const { t } = useTranslation();
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
      return t("activity.items.obtainedAllAndPlatinum");
    } else if (hasCompleted) {
      return t("activity.items.completedAllAchievements");
    } else if (hasPlatinum) {
      return t("activity.items.obtainedPlatinum");
    } else {
      return t("activity.items.obtainedAchievements", {
        count: totalObtained,
        suffix: totalObtained > 1 ? "s" : "",
      });
    }
  }, [activity, t]);

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
            {t("actions.seeMore")}
          </TextLink>
        </Stack>
      </PopoverElement.Dropdown>
    </PopoverElement>
  );
};

export { ObtainedAchievementActivityContent };
