import React, { PropsWithChildren } from "react";
import { GameSelectViewContent } from "./GameSelectViewContent";
import { GameViewPagination } from "../GameViewPagination";
import { GameSelectActions } from "./GameSelectActions";
import { GameSelectSearchBar } from "./GameSelectSearchBar";

const GameSelectView = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

GameSelectView.Content = GameSelectViewContent;
GameSelectView.Pagination = GameViewPagination;
GameSelectView.Actions = GameSelectActions;
GameSelectView.SearchBar = GameSelectSearchBar;

export { GameSelectView };
