import React, { useCallback, useMemo } from "react";
import { Box, Divider, Skeleton, Stack, Text, Title } from "@mantine/core";
import {
  CenteredErrorMessage,
  GameAchievementListItem,
  GameAchievementProgressOverview,
  useGameAchievements,
} from "#@/components";
import { GameExternalGame, GameExternalStoreDto } from "@repo/wrapper/server";
import { match, P } from "ts-pattern";

interface Props {
  externalGame: GameExternalStoreDto;
}

const GameAchievementsList = ({ externalGame }: Props) => {
  const { data, isLoading, isError, error } = useGameAchievements(
    externalGame.id,
  );

  const achievements = useMemo(() => data ?? [], [data]);

  const buildLoadingSkeletons = useCallback(() => {
    return new Array(5)
      .fill(0)
      .map((_, i) => (
        <Skeleton key={i} className={"h-12 w-full pe-3 lg:pe-0 lg:w-96"} />
      ));
  }, []);

  const renderItens = useCallback(() => {
    return match(externalGame.category)
      .with(
        P.union(
          GameExternalStoreDto.category._1,
          GameExternalStoreDto.category._11,
        ),
        () => {
          return (
            <Stack>
              <GameAchievementProgressOverview externalGame={externalGame} />
              {achievements.map((achievement) => (
                <GameAchievementListItem
                  key={achievement.externalId}
                  achievement={achievement}
                />
              ))}
            </Stack>
          );
        },
      )
      .with(GameExternalGame.category._36, () => {
        const platformGroups = new Set(
          achievements.flatMap((achievement) => achievement.platformIds),
        );

        return (
          Array.from(platformGroups)
            // Gives priority to ps5 (platformId = 167)
            .toSorted((a, b) => b - a)
            .map((platformId) => {
              const platformAchievements = achievements.filter((achievement) =>
                achievement.platformIds.includes(platformId),
              );

              return (
                <Stack key={platformId}>
                  <GameAchievementProgressOverview
                    externalGame={externalGame}
                    targetPlatformId={platformId}
                  />
                  {platformAchievements.map((achievement) => (
                    <GameAchievementListItem
                      key={`psn-${platformId}-${achievement.externalId}`}
                      achievement={achievement}
                    />
                  ))}
                </Stack>
              );
            })
        );
      })
      .otherwise(() => <div></div>);
  }, [achievements, externalGame.category]);

  return (
    <Stack className={"w-full"}>
      <Stack className={"w-full ps-3 gap-6"}>
        <Text className={"text-dimmed text-sm"}>
          Beware: some achievements may contain spoilers.
        </Text>
        {isError && <CenteredErrorMessage error={error} />}
        {isLoading && buildLoadingSkeletons()}
        {!isLoading && !isError && renderItens()}
      </Stack>
    </Stack>
  );
};

export { GameAchievementsList };
