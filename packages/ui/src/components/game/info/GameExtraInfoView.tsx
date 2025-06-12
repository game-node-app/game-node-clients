import React from "react";
import { Flex, Paper, Stack } from "@mantine/core";
import { Break } from "#@/components/general/Break";
import { GameRelatedGamesCarousel } from "#@/components/game/info/GameRelatedGamesCarousel";

interface IGameExtraInfoViewProps {
  id: number;
}

const GameExtraInfoView = ({ id }: IGameExtraInfoViewProps) => {
  return (
    <Stack w={"100%"} h={"100%"} className={"bg-[#262525]"}>
      <GameRelatedGamesCarousel
        title={"Expansion of"}
        gameId={id}
        relationProperty={"expansionOf"}
      />
      <GameRelatedGamesCarousel
        title={"Expansions"}
        gameId={id}
        relationProperty={"expansions"}
      />

      <GameRelatedGamesCarousel
        title={"DLC of"}
        gameId={id}
        relationProperty={"dlcOf"}
      />

      <GameRelatedGamesCarousel
        title={"DLCs"}
        gameId={id}
        relationProperty={"dlcs"}
      />

      <GameRelatedGamesCarousel
        title={"Similar games"}
        gameId={id}
        relationProperty={"similarGames"}
      />
    </Stack>
  );
};

export { GameExtraInfoView };
