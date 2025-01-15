import React, { createContext, PropsWithChildren } from "react";
import GameViewContent from "@/components/game/view/GameViewContent";
import GameViewLayoutSwitcher from "@/components/game/view/GameViewLayoutSwitcher";

export type GameViewLayoutOption = "grid" | "list";

interface IGameViewProps extends PropsWithChildren {
    layout: GameViewLayoutOption;
}

type IGameViewContext = Pick<IGameViewProps, "layout">;

export const GameViewContext = createContext<IGameViewContext>({
    layout: "grid",
});

/**
 * Component responsible for rendering a list or grid of games.
 * Related components should be used to provide the necessary functionality (e.g. layout selector, pagination).
 * @param children
 * @param layout
 * @param loadMoreMode
 * @constructor
 *
 */
const GameView = ({ children, layout = "grid" }: IGameViewProps) => {
    return <GameViewContext.Provider value={{ layout: layout }}>{children}</GameViewContext.Provider>;
};

GameView.Content = GameViewContent;
GameView.LayoutSwitcher = GameViewLayoutSwitcher;

export default GameView;
