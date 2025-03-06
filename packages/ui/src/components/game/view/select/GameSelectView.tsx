import React, { PropsWithChildren } from "react";
import { GameSelectViewContent } from "./GameSelectViewContent";
import { GameViewPagination } from "../GameViewPagination";
import { GameSelectActions } from "./GameSelectActions";

const GameSelectView = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

GameSelectView.Content = GameSelectViewContent;
GameSelectView.Pagination = GameViewPagination;
GameSelectView.Actions = GameSelectActions;

export { GameSelectView };
