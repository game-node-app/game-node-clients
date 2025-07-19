import React, { useMemo } from "react";
import {
  GameAchievementWithObtainedInfo,
  useGameAchievementsV2,
  useGamesResource,
  XBOX_STORES,
} from "#@/components";
import { GameAchievementGroupDto } from "@repo/wrapper/server";
import { Badge, Box, Group, Image, Progress, Stack, Text } from "@mantine/core";
import { getServerStoredIcon } from "#@/util";
import { match, P } from "ts-pattern";
import { IconTrophyFilled } from "@tabler/icons-react";

interface Props {
  userId: string | undefined;
  gameId: number;
  source: GameAchievementGroupDto.source;
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
  gameId,
  userId,
  source,
  targetPlatformId,
}: Props) => {
  const { data, isLoading, isError, error } = useGameAchievementsV2(
    userId,
    gameId,
  );

  const platformsQuery = useGamesResource("platforms");

  const targetAchievementsGroup = useMemo(() => {
    return data?.find((group) => group.source === source);
  }, [data, source]);

  const targetAchievements = useMemo(() => {
    if (targetAchievementsGroup == undefined) return [];

    return targetAchievementsGroup.achievements.filter((achievement) => {
      if (targetPlatformId) {
        return achievement.platformIds.includes(targetPlatformId);
      }

      return true;
    });
  }, [targetAchievementsGroup, targetPlatformId]);

  const availablePlatforms = useMemo(() => {
    if (
      platformsQuery.data == undefined ||
      targetAchievementsGroup == undefined
    )
      return [];

    const availablePlatformIds = Array.from(
      new Set(
        targetAchievements.flatMap((achievement) => achievement.platformIds),
      ),
    );

    return platformsQuery.data.filter((platform) => {
      if (targetPlatformId != undefined) {
        return platform.id === targetPlatformId;
      }

      return availablePlatformIds.includes(platform.id);
    });
  }, [
    platformsQuery.data,
    targetAchievements,
    targetAchievementsGroup,
    targetPlatformId,
  ]);

  const renderedAchievementTotal = useMemo(() => {
    return match(source)
      .with(P.union(GameAchievementGroupDto.source._1), () => {
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
      .with(P.union(...XBOX_STORES), () => {
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
      .with(GameAchievementGroupDto.source._36, () => {
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
  }, [source, targetAchievements]);

  const renderedAchievementCount = useMemo(() => {
    return match(source)
      .with(GameAchievementGroupDto.source._1, () => {
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
  }, [source, targetAchievements]);

  return (
    <Group>
      <Box className={"p-1"}>
        {targetAchievementsGroup && (
          <Image
            alt={targetAchievementsGroup?.sourceName ?? "External Store"}
            src={getServerStoredIcon(targetAchievementsGroup?.iconName)}
            className={"h-8 w-8 object-contain"}
          />
        )}
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
