import React, { PropsWithChildren } from "react";
import { GameSelectViewContent } from "./GameSelectViewContent";
import { GameViewPagination } from "../GameViewPagination";
import { GameSelectActions } from "./GameSelectActions";

interface GameSelectViewProps extends PropsWithChildren {}

const GameSelectView = ({ children }: GameSelectViewProps) => {
  return <>{children}</>;
};

GameSelectView.Content = GameSelectViewContent;
GameSelectView.Pagination = GameViewPagination;
GameSelectView.Actions = GameSelectActions;

export { GameSelectView };
