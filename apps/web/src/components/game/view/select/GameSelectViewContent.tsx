import React, { PropsWithChildren, useMemo } from "react";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { SimpleGrid, SimpleGridProps } from "@mantine/core";
import GameSelectViewFigure, {
    GameSelectViewFigureProps,
} from "@/components/game/view/select/GameSelectViewFigure";

type SelectedProps = Pick<
    GameSelectViewFigureProps,
    | "onSelected"
    | "checkIsSelected"
    | "excludeItemsInLibrary"
    | "onExcludedItemClick"
>;

interface Props extends PropsWithChildren<SimpleGridProps & SelectedProps> {
    items: TGameOrSearchGame[];
}

/**
 * Component similar to GameViewContent that allows users to select items on click.
 * @param items
 * @param children
 * @param checkIsSelected
 * @param onSelected
 * @param excludeItemsInLibrary
 * @param onExcludedItemClick
 * @param others
 * @constructor
 */
const GameSelectViewContent = ({
    items,
    children,
    checkIsSelected,
    onSelected,
    excludeItemsInLibrary,
    onExcludedItemClick,
    ...others
}: Props) => {
    const columns = useMemo(() => {
        if (items == undefined || items.length === 0) {
            return null;
        }

        return items.map((game) => {
            return (
                <GameSelectViewFigure
                    key={game.id!}
                    checkIsSelected={checkIsSelected}
                    onSelected={onSelected}
                    game={game}
                    excludeItemsInLibrary={excludeItemsInLibrary}
                    onExcludedItemClick={onExcludedItemClick}
                />
            );
        });
    }, [
        checkIsSelected,
        excludeItemsInLibrary,
        items,
        onExcludedItemClick,
        onSelected,
    ]);

    return (
        <SimpleGrid
            id={"game-select-view-content"}
            cols={{
                base: 2,
                lg: 5,
            }}
            w={"100%"}
            h={"100%"}
            {...others}
        >
            {columns}
            {children}
        </SimpleGrid>
    );
};

export default GameSelectViewContent;
