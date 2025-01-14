import React, { PropsWithChildren } from "react";
import GameSelectViewContent from "@/components/game/view/select/GameSelectViewContent";
import GameSelectActions from "@/components/game/view/select/GameSelectActions";
import GameViewPagination from "@/components/game/view/GameViewPagination";

const GameSelectView = ({ children }: PropsWithChildren) => {
    return <>{children}</>;
};

GameSelectView.Content = GameSelectViewContent;
GameSelectView.Actions = GameSelectActions;
GameSelectView.Pagination = GameViewPagination;

export default GameSelectView;
