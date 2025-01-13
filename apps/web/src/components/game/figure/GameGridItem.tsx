import React, { MutableRefObject, useMemo } from "react";
import GameFigureImage, {
    IGameFigureProps,
} from "@/components/game/figure/GameFigureImage";
import { Badge } from "@mantine/core";
import { getGameCategoryName } from "@/components/game/util/getGameCategoryName";
import { TGameOrSearchGame } from "@/components/game/util/types";
import GameFigureWithQuickAdd from "@/components/game/figure/GameFigureWithQuickAdd";

interface IGameGridFigureProps {
    game: TGameOrSearchGame;
    figureProps?: Omit<Partial<IGameFigureProps>, "game">;
    /**
     * If quick add functionality should be enabled. Checks will still be performed to see if
     * it's possible to show the game add modal.
     */
    withQuickAdd?: boolean;
}

const GameGridItem = ({
    game,
    figureProps,
    withQuickAdd = true,
}: IGameGridFigureProps) => {
    const Figure = withQuickAdd ? GameFigureWithQuickAdd : GameFigureImage;

    return <Figure {...figureProps} game={game} href={`/game/${game?.id}`} />;
};

export default GameGridItem;
