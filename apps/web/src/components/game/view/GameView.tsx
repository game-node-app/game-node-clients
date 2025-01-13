import React, { createContext, PropsWithChildren } from "react";
import { Stack } from "@mantine/core";
import GameViewContent from "@/components/game/view/GameViewContent";
import GameViewPagination from "@/components/game/view/GameViewPagination";
import GameViewLayoutSwitcher from "@/components/game/view/GameViewLayoutSwitcher";

interface IGameViewProps extends PropsWithChildren {
    layout: "grid" | "list";
}

interface IGameViewContext extends Pick<IGameViewProps, "layout"> {}

export const GameViewContext = createContext<IGameViewContext>({
    layout: "grid",
});

/**
 * Component responsible for rendering a list or grid of games.
 * Related components should be used to provide the necessary functionality (e.g. layout selector, pagination).
 * @param children
 * @param layout
 * @constructor
 */
const GameView = ({ children, layout = "grid" }: IGameViewProps) => {
    return (
        <GameViewContext.Provider value={{ layout: layout }}>
            {children}
        </GameViewContext.Provider>
    );
};

GameView.Content = GameViewContent;
GameView.Pagination = GameViewPagination;
GameView.LayoutSwitcher = GameViewLayoutSwitcher;

export default GameView;
