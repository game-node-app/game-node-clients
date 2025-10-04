import React, { useMemo } from "react";
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
  relationProperty: keyof Game | (keyof Game)[];
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

  const targetGames = useMemo(() => {
    const targetProperties = Array.isArray(relationProperty)
      ? relationProperty
      : [relationProperty];

    return targetProperties
      .map((property) => gameQuery.data?.[property] as Game[] | undefined)
      .flat(1)
      .filter((game) => game != undefined);
  }, [gameQuery.data, relationProperty]);

  const isEmpty = targetGames.length === 0;

  if (isEmpty) return null;

  return (
    <DetailsBox title={title} withPadding withDimmedTitle withBackground>
      <Box className={"lg:p-3"}>
        <GameInfoCarousel
          isLoading={gameQuery.isLoading}
          isError={gameQuery.isError}
          games={targetGames || []}
        />
      </Box>
    </DetailsBox>
  );
};

export { GameRelatedGamesCarousel };
