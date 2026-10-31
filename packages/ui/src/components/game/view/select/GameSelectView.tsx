import { PropsWithChildren } from "react";
import { GameViewPagination } from "../GameViewPagination";
import { GameSelectActions } from "./GameSelectActions";
import { GameSelectSearchBar } from "./GameSelectSearchBar";
import { GameSelectViewContent } from "./GameSelectViewContent";

const GameSelectView = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

GameSelectView.Content = GameSelectViewContent;
GameSelectView.Pagination = GameViewPagination;
GameSelectView.Actions = GameSelectActions;
GameSelectView.SearchBar = GameSelectSearchBar;

export { GameSelectView };