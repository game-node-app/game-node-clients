import React from "react";
import { Game, GameRepositoryFindOneDto } from "@/wrapper/server";
import { useGame } from "@/components/game/hooks/useGame";
import { DetailsBox } from "@/components/general/DetailsBox";
import GameInfoCarousel from "@/components/game/info/carousel/GameInfoCarousel";

export const DEFAULT_RELATED_GAMES_QUERY: GameRepositoryFindOneDto = {
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
    },
};

interface GameRelatedGameCarouselProps {
    title: string;
    gameId: number;
    relationProperty: keyof Game;
}

/**
 * Make sure the target relation property is added to DEFAULT_RELATED_GAMES_QUERY before using this.
 * @param title
 * @param gameId
 * @param relationProperty
 * @constructor
 * @see DEFAULT_RELATED_GAMES_QUERY
 */
const GameRelatedGamesCarousel = ({ title, gameId, relationProperty }: GameRelatedGameCarouselProps) => {
    const gameWithRelationsQuery = useGame(gameId, DEFAULT_RELATED_GAMES_QUERY);

    // Make sure to add runtime checks for an array of games too.
    const relationData = gameWithRelationsQuery.data?.[relationProperty] as Game[] | undefined;

    const hasRelations =
        relationData != undefined && Array.isArray(relationData) != undefined && relationData.length > 0;

    const enabled = hasRelations || gameWithRelationsQuery.isLoading;

    return (
        <DetailsBox enabled={enabled} title={title}>
            <GameInfoCarousel
                isLoading={gameWithRelationsQuery.isLoading}
                isError={gameWithRelationsQuery.isError}
                games={relationData || []}
            />
        </DetailsBox>
    );
};

export default GameRelatedGamesCarousel;
