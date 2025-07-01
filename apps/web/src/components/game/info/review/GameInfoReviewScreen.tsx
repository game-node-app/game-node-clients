import React from "react";

import { Paper, Stack, StackProps } from "@mantine/core";
import GameInfoReviewEditorView from "@/components/game/info/review/editor/GameInfoReviewEditorView";
import { GameInfoReviewList } from "@repo/ui";

interface IGameInfoReviewViewProps {
  gameId: number;
  targetReviewId?: string;
  withPagination?: boolean;
  withViewMore?: boolean;
}

const GameInfoReviewScreen = ({
  gameId,
  targetReviewId,
  withPagination = true,
  withViewMore = false,
}: IGameInfoReviewViewProps) => {
  if (!gameId) return null;
  return (
    <Stack w={"100%"} h={"100%"} align={"center"}>
      <GameInfoReviewEditorView gameId={gameId} />
      <GameInfoReviewList
        gameId={gameId}
        targetReviewId={targetReviewId}
        withPagination={withPagination}
        withViewMore={withViewMore}
      />
    </Stack>
  );
};

export default GameInfoReviewScreen;
