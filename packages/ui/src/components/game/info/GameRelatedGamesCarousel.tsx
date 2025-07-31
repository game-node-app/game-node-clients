import React from "react";
import { Game, GameRepositoryFindOneDto } from "@repo/wrapper/server";
import { useGame } from "#@/components/game/hooks/useGame";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameInfoCarousel } from "#@/components/game/info/carousel/GameInfoCarousel";
import { Box } from "@mantine/core";

export const DEFAULT_RELATED_GAMES_DTO: GameRepositoryFindOneDto = {
  relations: {
    similarGames: {
      cover: true,
    },
    dlcOf: {
      cover: true,
    },
    dlcs: {
      cover: true,
    },
    expansionOf: {
      cover: true,
    },
    expansions: {
      cover: true,
    },
    remakes: {
      cover: true,
    },
    remakeOf: {
      cover: true,
    },
    expandedGames: {
      cover: true,
    },
    expandedGameOf: {
      cover: true,
    },
    remasters: {
      cover: true,
    },
    remasterOf: {
      cover: true,
    },
  },
};

interface GameRelatedGameCarouselProps {
  title: string;
  gameId: number;
  relationProperty: keyof Game;
}

/**
 * Make sure the target relation (and the cover field) is added to DEFAULT_RELATED_GAMES_DTO
 * before using this.
 * @param title
 * @param gameId
 * @param relationProperty
 * @constructor
 * @see DEFAULT_RELATED_GAMES_DTO
 */
const GameRelatedGamesCarousel = ({
  title,
  gameId,
  relationProperty,
}: GameRelatedGameCarouselProps) => {
  const gameQuery = useGame(gameId, DEFAULT_RELATED_GAMES_DTO);

  // Make sure to add runtime checks for an array of games too.
  const relationData = gameQuery.data?.[relationProperty] as Game[] | undefined;

  const hasRelations =
    relationData != undefined &&
    Array.isArray(relationData) != undefined &&
    relationData.length > 0;

  if (!hasRelations) return null;

  return (
    <Box className={"bg-[#262525] p-3"}>
      <DetailsBox
        title={title}
        stackProps={{
          bg: "#262525",
        }}
      >
        <GameInfoCarousel
          isLoading={gameQuery.isLoading}
          isError={gameQuery.isError}
          games={relationData || []}
        />
      </DetailsBox>
    </Box>
  );
};

export { GameRelatedGamesCarousel };
