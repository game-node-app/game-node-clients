import React, { useMemo } from "react";
import { GameExternalGame, GameExternalStoreDto } from "@repo/wrapper/server";
import { Box, Group, Image, Skeleton, Text } from "@mantine/core";
import { getServerStoredIcon, Link } from "#@/util";
import { useGameAchievements } from "#@/components";
import { match, P } from "ts-pattern";

interface Props {
  externalGame: GameExternalStoreDto;
}

const GameInfoAchievementOverviewItem = ({ externalGame }: Props) => {
  const { data, isLoading, isError } = useGameAchievements(externalGame.id);

  const isEmpty = data != undefined && data.length === 0;

  const renderedAchievementsCount = useMemo(() => {
    if (data == undefined) return null;

    return match(externalGame.category)
      .with(
        P.union(GameExternalGame.category._1, GameExternalGame.category._11),
        () => {
          const totalAchievements = data.length;
          const totalObtainedAchievements = data.filter(
            (achievement) => achievement.isObtained,
          ).length;

          return (
            <Text>
              <Text span className={"font-bold"}>
                {totalObtainedAchievements}
              </Text>{" "}
              of{" "}
              <Text span className={"font-bold"}>
                {totalAchievements}
              </Text>{" "}
              Achievements
            </Text>
          );
        },
      )
      .with(GameExternalGame.category._36, () => {
        const firstObtainedAchievement = data.find(
          (achievement) => achievement.isObtained,
        );

        const availablePlatformIds = Array.from(
          new Set(
            data.map((achievement) => achievement.psnDetails!.platformId),
          ),
          // Priority to PS5 (167)
        ).toSorted((a, b) => b - a);

        const preferredPlatformId =
          firstObtainedAchievement?.psnDetails?.platformId ??
          availablePlatformIds.at(0);

        const filteredAchievements = data.filter((achievement) => {
          if (preferredPlatformId) {
            return achievement.psnDetails!.platformId === preferredPlatformId;
          }

          return true;
        });

        const totalAchievements = filteredAchievements.length;
        const totalObtainedAchievements = filteredAchievements.filter(
          (achievement) => achievement.isObtained,
        ).length;

        return (
          <Text>
            <Text span className={"font-bold"}>
              {totalObtainedAchievements}
            </Text>{" "}
            of <Text span>{totalAchievements}</Text> Trophies
          </Text>
        );
      })
      .otherwise(() => <div></div>);
  }, [data, externalGame.category]);

  if (isError || isEmpty || isLoading) return null;

  return (
    <Link
      href={`/game/${externalGame.gameId}?tab=achievements`}
      scroll={false}
      replace
      className={"hover:bg-paper rounded-sm p-3"}
    >
      <Group className={"flex-nowrap gap-2 max-w-fit"}>
        <Box className={"p-1"}>
          <Image
            alt={externalGame.storeName ?? "External Store"}
            src={getServerStoredIcon(externalGame.icon!)}
            className={"h-8 w-8 object-contain"}
          />
        </Box>
        <Box className={"p-1"}>{renderedAchievementsCount}</Box>
      </Group>
    </Link>
  );
};

export { GameInfoAchievementOverviewItem };
