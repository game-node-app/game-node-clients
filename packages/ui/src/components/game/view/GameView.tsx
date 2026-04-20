import React, { createContext, PropsWithChildren } from "react";
import { GameViewContent } from "#@/components/game/view/GameViewContent";
import { GameViewPagination } from "#@/components/game/view/GameViewPagination";
import { GameViewLoadingSkeletons } from "#@/components/game/view/GameViewLoadingSkeletons";
import { GameViewLayoutSwitcher } from "#@/components/game/view/layout/GameViewLayoutSwitcher";
import type { MantineBreakpoint } from "@mantine/core";

interface IGameViewProps extends PropsWithChildren {
  layout: "grid" | "list";
  cols: Partial<Record<MantineBreakpoint | (string & {}), number>>;
}

type IGameViewContext = Pick<IGameViewProps, "layout" | "cols">;

export const GameViewContext = createContext<IGameViewContext>({
  layout: "grid",
  cols: {
    base: 4,
    lg: 6,
  },
});

/**
 * Component responsible for rendering a list or grid of games.
 * Related components should be used to provide the necessary functionality (e.g. layout selector, pagination).
 * @param children
 * @param layout - layout of the game view, either "grid" or "list"
 * @param cols - number of columns to display in the grid layout, responsive values can be provided using Mantine's breakpoint system <br>
 * list layout will ignore this prop and always display one column
 * @constructor
 */
const GameView = ({
  children,
  layout = "grid",
  cols = {
    base: 4,
    lg: 6,
  },
}: Partial<IGameViewProps>) => {
  return (
    <GameViewContext.Provider value={{ layout: layout, cols: cols }}>
      {children}
    </GameViewContext.Provider>
  );
};

GameView.Content = GameViewContent;
GameView.Pagination = GameViewPagination;
GameView.LayoutSwitcher = GameViewLayoutSwitcher;
GameView.LoadingSkeletons = GameViewLoadingSkeletons;

export { GameView };
