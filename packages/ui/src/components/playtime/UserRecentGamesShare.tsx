import React, { useEffect } from "react";
import { Modal } from "#@/util";
import { Badge, Chip, SimpleGrid, Stack, Text } from "@mantine/core";
import {
  GameFigureImage,
  useGames,
  usePlaytimeForUser,
  useUserId,
} from "#@/components";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";
import period = FindAllPlaytimeFiltersDto.period;

interface Props {
  opened: boolean;
  onClose: () => void;
}

const UserRecentGamesShare = ({ opened, onClose }: Props) => {
  const userId = useUserId()!;

  const playtimeQuery = usePlaytimeForUser({
    userId: userId,
    period: period.ALL,
    orderBy: {
      recentPlaytimeSeconds: "DESC",
    },
    limit: 9,
  });

  const gameIds = playtimeQuery.data?.data.map((playtime) => playtime.gameId);

  const gamesQuery = useGames({
    gameIds: gameIds,
    relations: {
      cover: true,
    },
  });

  return (
    <Modal opened={opened} onClose={onClose}>
      <Text>Preview</Text>
      <Stack className={"bg-[#191919] p-4"}>
        <SimpleGrid cols={3} className={"gap-0"}>
          {gamesQuery.data?.map((game) => {
            return (
              <GameFigureImage
                key={game.id}
                game={game}
                imageProps={{
                  radius: undefined,
                }}
              />
            );
          })}
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};

export { UserRecentGamesShare };
