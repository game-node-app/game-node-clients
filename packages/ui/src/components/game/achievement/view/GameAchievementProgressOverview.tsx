import React, { useMemo } from "react";
import {
  GameAchievementWithObtainedInfo,
  useGameAchievements,
  useGamesResource,
} from "#@/components";
import { GameExternalStoreDto } from "@repo/wrapper/server";
import {
  Badge,
  Box,
  Center,
  Group,
  Image,
  Progress,
  Stack,
  Text,
} from "@mantine/core";
import { getServerStoredIcon } from "#@/util";
import { match, P } from "ts-pattern";
import { IconTrophyFilled } from "@tabler/icons-react";

interface Props {
  externalGame: GameExternalStoreDto;
  /**
   * If not undefined, will be used to filter progress data.
   */
  targetPlatformId?: number;
}

const TROPHY_TYPES = ["platinum", "gold", "silver", "bronze"] as const;

const TROPHY_TYPE_TO_COLOR = {
  platinum: "#7a96d1",
  gold: "#cd9a46",
  silver: "#c5c5c5",
  bronze: "#bf6a3a",
} as const;

const countByTrophyType = (
  list: GameAchievementWithObtainedInfo[],
  trophyType: keyof typeof TROPHY_TYPE_TO_COLOR,
) => {
  const itemsForType = list.filter(
    (achievement) => achievement.psnDetails?.trophyType === trophyType,
  );

  const totalObtained = itemsForType.reduce((acc, curr) => {
    if (curr.isObtained) {
      return acc + 1;
    }

    return acc;
  }, 0);

  return {
    total: itemsForType.length,
    totalObtained,
    trophyType,
  } as const;
};

const GameAchievementProgressOverview = ({
  externalGame,
  targetPlatformId,
}: Props) => {
  const { data, isLoading, isError, error } = useGameAchievements(
    externalGame.id,
  );

  const platformsQuery = useGamesResource("platforms");

  const targetAchievements = useMemo(() => {
    if (data == undefined) return [];

    return data.filter((achievement) => {
      if (targetPlatformId) {
        return achievement.platformIds.includes(targetPlatformId);
      }

      return true;
    });
  }, [data, targetPlatformId]);

  const availablePlatforms = useMemo(() => {
    if (platformsQuery.data == undefined || data == undefined) return [];

    const availablePlatformIds = Array.from(
      new Set(data.flatMap((achievement) => achievement.platformIds)),
    );

    return platformsQuery.data.filter((platform) => {
      if (targetPlatformId != undefined) {
        return platform.id === targetPlatformId;
      }

      return availablePlatformIds.includes(platform.id);
    });
  }, [data, platformsQuery.data, targetPlatformId]);

  const renderedAchievementTotal = useMemo(() => {
    return match(externalGame.category)
      .with(P.union(GameExternalStoreDto.category._1), () => {
        const totalAchievements = targetAchievements.length;
        const totalObtainedAchievements = targetAchievements.reduce(
          (acc, curr) => {
            if (curr.isObtained) return acc + 1;

            return acc;
          },
          0,
        );

        return (
          <Progress
            size={"lg"}
            value={(totalObtainedAchievements / totalAchievements) * 100}
            className={"relative"}
          />
        );
      })
      .with(GameExternalStoreDto.category._11, () => {
        const totalGamerscore = targetAchievements.reduce((acc, curr) => {
          if (curr.xboxDetails != undefined) {
            return acc + curr.xboxDetails.gamerScore;
          }

          return acc;
        }, 0);

        const totalObtainedGamerscore = targetAchievements.reduce(
          (acc, curr) => {
            if (curr.xboxDetails != undefined && curr.isObtained) {
              return acc + curr.xboxDetails.gamerScore;
            }

            return acc;
          },
          0,
        );

        return (
          <Group className={"items-center gap-1"}>
            <Image
              src={getServerStoredIcon("xbox_achievement")}
              alt={"Gamerscore icon"}
              className={"w-8 h-8 object-contain"}
            />
            <Text className={"text-lg font-bold"}>
              {totalObtainedGamerscore} / {totalGamerscore}
            </Text>
          </Group>
        );
      })
      .with(GameExternalStoreDto.category._36, () => {
        const trophyInfos = TROPHY_TYPES.map((trophyType) =>
          countByTrophyType(targetAchievements, trophyType),
        );

        return (
          <Group className={"flex-nowrap gap-1"}>
            {trophyInfos.map((trophyInfo) => {
              return (
                <Group
                  key={trophyInfo.trophyType}
                  className={"gap-1 flex-nowrap items-center"}
                  c={TROPHY_TYPE_TO_COLOR[trophyInfo.trophyType]}
                >
                  <IconTrophyFilled size={16} />
                  <Text className={"font-bold"} span>
                    {trophyInfo.totalObtained} / {trophyInfo.total}
                  </Text>
                </Group>
              );
            })}
          </Group>
        );
      })
      .otherwise(() => null);
  }, [externalGame.category, targetAchievements]);

  const renderedAchievementCount = useMemo(() => {
    return match(externalGame.category)
      .with(GameExternalStoreDto.category._1, () => {
        const totalAchievements = targetAchievements.length;
        const totalObtainedAchievements = targetAchievements.reduce(
          (acc, curr) => {
            if (curr.isObtained) return acc + 1;

            return acc;
          },
          0,
        );

        return (
          <Text>
            <Text className={"font-bold"} span>
              {totalObtainedAchievements}
            </Text>{" "}
            of{" "}
            <Text className={"font-bold"} span>
              {totalAchievements}
            </Text>
          </Text>
        );
      })
      .otherwise(() => null);
  }, [externalGame.category, targetAchievements]);

  return (
    <Group>
      <Box className={"p-1"}>
        <Image
          alt={externalGame.storeName ?? "External Store"}
          src={getServerStoredIcon(externalGame.icon!)}
          className={"h-8 w-8 object-contain"}
        />
      </Box>
      <Stack className={"grow lg:max-w-96"}>
        {renderedAchievementTotal}
        <Group className={"flex-nowrap justify-between"}>
          <Group className={"flex-nowrap gap-1"}>
            {availablePlatforms.map((platform) => (
              <Badge
                key={`platform-${platform.id}`}
                variant={"default"}
                size={"sm"}
              >
                {platform.abbreviation.toUpperCase()}
              </Badge>
            ))}
          </Group>
          {renderedAchievementCount}
        </Group>
      </Stack>
    </Group>
  );
};

export { GameAchievementProgressOverview };
