import React from "react";
import { Game, GameRepositoryFindOneDto } from "@repo/wrapper/server";
import { useGame } from "#@/components/game/hooks/useGame";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameInfoCarousel } from "#@/components/game/info/carousel/GameInfoCarousel";

export const DEFAULT_RELATED_GAMES_DTO: GameRepositoryFindOneDto = {
  relations: {
    involvedCompanies: {
      company: true,
    },
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

  return (
    <DetailsBox
      enabled={hasRelations}
      title={title}
      stackProps={{
        className: "p-3",
      }}
    >
      <GameInfoCarousel
        isLoading={gameQuery.isLoading}
        isError={gameQuery.isError}
        games={relationData || []}
      />
    </DetailsBox>
  );
};

export { GameRelatedGamesCarousel };
