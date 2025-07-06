import React from "react";
import { Flex, Paper, SimpleGrid, Stack } from "@mantine/core";
import { Break } from "#@/components/general/Break";
import { GameRelatedGamesCarousel } from "#@/components/game/info/GameRelatedGamesCarousel";
import {
  DetailsBox,
  GameInfoAchievementOverview,
  GameInfoPlaytimeTracker,
  GameInfoProgressTimeline,
} from "#@/components";

interface IGameExtraInfoViewProps {
  gameId: number;
}

const GameExtraInfoView = ({ gameId }: IGameExtraInfoViewProps) => {
  return (
    <Stack className={"w-full gap-5"}>
      <SimpleGrid
        cols={{
          base: 1,
          lg: 3,
        }}
      >
        <GameInfoAchievementOverview gameId={gameId} />
        <GameInfoPlaytimeTracker gameId={gameId} />
        <GameInfoProgressTimeline gameId={gameId} />
      </SimpleGrid>

      <GameRelatedGamesCarousel
        title={"Expansion of"}
        gameId={gameId}
        relationProperty={"expansionOf"}
      />
      <GameRelatedGamesCarousel
        title={"Expansions"}
        gameId={gameId}
        relationProperty={"expansions"}
      />

      <GameRelatedGamesCarousel
        title={"DLC of"}
        gameId={gameId}
        relationProperty={"dlcOf"}
      />

      <GameRelatedGamesCarousel
        title={"DLCs"}
        gameId={gameId}
        relationProperty={"dlcs"}
      />

      <GameRelatedGamesCarousel
        title={"Similar games"}
        gameId={gameId}
        relationProperty={"similarGames"}
      />
    </Stack>
  );
};

export { GameExtraInfoView };
