import React from "react";
import { Flex, Paper } from "@mantine/core";
import { Break } from "#@/components/general/Break";
import { GameRelatedGamesCarousel } from "#@/components/game/info/GameRelatedGamesCarousel";

interface IGameExtraInfoViewProps {
  id: number;
}

const GameExtraInfoView = ({ id }: IGameExtraInfoViewProps) => {
  return (
    <Paper w={"100%"} h={"100%"} suppressHydrationWarning>
      <Flex w={"100%"} h={"100%"} wrap={"wrap"}>
        <GameRelatedGamesCarousel
          title={"Expansion of"}
          gameId={id}
          relationProperty={"expansionOf"}
        />
        <Break />
        <GameRelatedGamesCarousel
          title={"Expansions"}
          gameId={id}
          relationProperty={"expansions"}
        />
        <Break />

        <GameRelatedGamesCarousel
          title={"DLC of"}
          gameId={id}
          relationProperty={"dlcOf"}
        />
        <Break />

        <GameRelatedGamesCarousel
          title={"DLCs"}
          gameId={id}
          relationProperty={"dlcs"}
        />
        <Break />

        <GameRelatedGamesCarousel
          title={"Similar games"}
          gameId={id}
          relationProperty={"similarGames"}
        />
      </Flex>
    </Paper>
  );
};

export { GameExtraInfoView };
