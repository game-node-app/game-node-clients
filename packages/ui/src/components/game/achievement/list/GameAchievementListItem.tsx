import React, { useCallback } from "react";
import { GameAchievementWithObtainedInfo } from "#@/components";
import {
  AspectRatio,
  Box,
  Group,
  Image,
  Overlay,
  Stack,
  Text,
} from "@mantine/core";
import { match } from "ts-pattern";
import { GameAchievementDto } from "@repo/wrapper/server";
import { getServerStoredIcon } from "#@/util";

interface Props {
  achievement: GameAchievementWithObtainedInfo;
}

const GameAchievementListItem = ({ achievement }: Props) => {
  const renderRightSideDetail = useCallback(() => {
    return match(achievement.source)
      .with(GameAchievementDto.source._1, () => {
        const details = achievement.steamDetails;
        if (!details) return null;

        return (
          <Stack className={"gap-1"}>
            <Text className={"text-md text-center"}>
              {details.globalPercentage}%
            </Text>
            <Text className={"text-center text-xs text-dimmed"}>Own by</Text>
          </Stack>
        );
      })
      .with(GameAchievementDto.source._36, () => {
        const details = achievement.psnDetails;
        if (!details) return null;
        return (
          <AspectRatio ratio={1} className={"min-w-12 w-12 min-h-12 h-12"}>
            <Image
              src={getServerStoredIcon(details.trophyIcon)}
              alt={achievement.name + details.trophyType}
              className={"w-full h-full object-contain"}
            />
          </AspectRatio>
        );
      })
      .with(GameAchievementDto.source._11, () => {
        const details = achievement.xboxDetails;
        if (!details) return null;

        return (
          <Group className={"items-center gap-1"}>
            <Image
              src={getServerStoredIcon("xbox_achievement")}
              alt={"Gamerscore icon"}
              className={"w-10 h-10 object-contain"}
            />
            <Text className={"text-lg font-bold"}>{details.gamerScore}</Text>
          </Group>
        );
      })
      .otherwise(() => null);
  }, [achievement]);

  return (
    <Group className={"w-full"}>
      <Group className={"w-full justify-between lg:justify-start lg:w-fit"}>
        <AspectRatio ratio={1} className={"relative w-12 h-12"}>
          <Image
            className={"w-full h-full"}
            src={achievement.iconUrl}
            alt={achievement.name}
          ></Image>
          {!achievement.isObtained && (
            <Overlay className={"z-0"} color="#000" backgroundOpacity={0.65} />
          )}
        </AspectRatio>
        <Box className={"block lg:hidden"}>{renderRightSideDetail()}</Box>
      </Group>

      <Group className={"grow justify-between lg:justify-start"}>
        <Stack className={"grow gap-1"}>
          <Text>{achievement.name}</Text>
          <Text className={"text-dimmed"}>{achievement.description}</Text>
        </Stack>
        <Box className={"hidden lg:block"}>{renderRightSideDetail()}</Box>
      </Group>
    </Group>
  );
};

export { GameAchievementListItem };
