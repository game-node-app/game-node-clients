import React, { useMemo } from "react";
import { GameExternalGame, GameExternalStoreDto } from "@repo/wrapper/server";
import { Badge, Box, Group, Image, Skeleton, Stack, Text } from "@mantine/core";
import { getServerStoredIcon, Link } from "#@/util";
import { useGameAchievements, useGamesResource } from "#@/components";
import { match, P } from "ts-pattern";

interface Props {
  externalGame: GameExternalStoreDto;
}

const GameInfoAchievementOverviewItem = ({ externalGame }: Props) => {
  const { data, isLoading, isError } = useGameAchievements(externalGame.id);
  const platformsQuery = useGamesResource("platforms");

  const isEmpty = data != undefined && data.length === 0;

  const availablePlatforms = useMemo(() => {
    if (platformsQuery.data == undefined || data == undefined) return [];

    const availablePlatformIds = Array.from(
      new Set(data.flatMap((achievement) => achievement.platformIds)),
    );

    return platformsQuery.data.filter((platform) => {
      return availablePlatformIds.includes(platform.id);
    });
  }, [data, platformsQuery.data]);

  const renderedAchievementsInfo = useMemo(() => {
    if (data == undefined) return null;

    return match(externalGame.category)
      .with(
        P.union(
          GameExternalGame.category._1,
          GameExternalGame.category._11,
          GameExternalGame.category._36,
        ),
        (selections) => {
          const totalAchievements = data.length;
          const itemName =
            selections === GameExternalGame.category._36
              ? "Trophies"
              : "Achievements";

          return (
            <Text>
              <Text span className={"font-bold"}>
                {totalAchievements}
              </Text>{" "}
              {itemName}
            </Text>
          );
        },
      )
      .otherwise(() => <div></div>);
  }, [data, externalGame.category]);

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
        <Stack className={"gap-1"}>
          <Box className={"p-1"}>{renderedAchievementsInfo}</Box>
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
        </Stack>
      </Group>
    </Link>
  );
};

export { GameInfoAchievementOverviewItem };
