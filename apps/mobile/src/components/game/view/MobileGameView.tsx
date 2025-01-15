import React, { createContext, PropsWithChildren } from "react";
import MobileGameViewContent from "@/components/game/view/MobileGameViewContent";
import MobileGameViewLayoutSwitcher from "@/components/game/view/MobileGameViewLayoutSwitcher";

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
const MobileGameView = ({ children, layout = "grid" }: IGameViewProps) => {
    return <GameViewContext.Provider value={{ layout: layout }}>{children}</GameViewContext.Provider>;
};

MobileGameView.Content = MobileGameViewContent;
MobileGameView.LayoutSwitcher = MobileGameViewLayoutSwitcher;

export default MobileGameView;
