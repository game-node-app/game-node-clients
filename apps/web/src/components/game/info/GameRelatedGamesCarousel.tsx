import React from "react";
import { Game } from "@/wrapper/server";
import { useGame } from "@/components/game/hooks/useGame";
import { DetailsBox } from "@/components/general/DetailsBox";
import GameInfoCarousel from "@/components/game/info/carousel/GameInfoCarousel";
import { DEFAULT_GAME_INFO_VIEW_DTO } from "./GameInfoView";

interface GameRelatedGameCarouselProps {
    title: string;
    gameId: number;
    relationProperty: keyof Game;
}

/**
 * Make sure the target relation (and the cover field) is added to DEFAULT_GAME_INFO_VIEW_DTO
 * before using this.
 * @param title
 * @param gameId
 * @param relationProperty
 * @constructor
 * @see DEFAULT_GAME_INFO_VIEW_DTO
 */
const GameRelatedGamesCarousel = ({
    title,
    gameId,
    relationProperty,
}: GameRelatedGameCarouselProps) => {
    const gameQuery = useGame(gameId, DEFAULT_GAME_INFO_VIEW_DTO);

    const data = gameQuery.data;
    // Make sure to add runtime checks for an array of games too.
    const relationData = gameQuery.data?.[relationProperty] as
        | Game[]
        | undefined;

    const hasRelations =
        relationData != undefined &&
        Array.isArray(relationData) != undefined &&
        relationData.length > 0;

    return (
        <DetailsBox enabled={hasRelations} title={title}>
            <GameInfoCarousel
                isLoading={gameQuery.isLoading}
                isError={gameQuery.isError}
                games={relationData || []}
            />
        </DetailsBox>
    );
};

export default GameRelatedGamesCarousel;
