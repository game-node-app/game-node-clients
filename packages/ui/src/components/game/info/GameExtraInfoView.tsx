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
import { useTranslation } from "@repo/locales";

interface IGameExtraInfoViewProps {
  gameId: number;
}

const GameExtraInfoView = ({ gameId }: IGameExtraInfoViewProps) => {
  const { t } = useTranslation();
  return (
    <Stack className={"w-full gap-5"}>
      <SimpleGrid
        cols={{
          base: 1,
          lg: 3,
        }}
      >
        <GameInfoAchievementOverview gameId={gameId} />
        <GameInfoProgressTimeline gameId={gameId} />
        <GameInfoPlaytimeTracker gameId={gameId} />
      </SimpleGrid>

      <GameRelatedGamesCarousel
        title={t("game.extra.otherVersions")}
        gameId={gameId}
        relationProperty={["remasters", "remakes"]}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.remakeOf")}
        gameId={gameId}
        relationProperty={"remakeOf"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.remasterOf")}
        gameId={gameId}
        relationProperty={"remasterOf"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.expansionOf")}
        gameId={gameId}
        relationProperty={"expansionOf"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.expansions")}
        gameId={gameId}
        relationProperty={"expansions"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.dlcOf")}
        gameId={gameId}
        relationProperty={"dlcOf"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.dlcs")}
        gameId={gameId}
        relationProperty={"dlcs"}
      />
      <GameRelatedGamesCarousel
        title={t("game.extra.similarGames")}
        gameId={gameId}
        relationProperty={"similarGames"}
      />
    </Stack>
  );
};

export { GameExtraInfoView };
