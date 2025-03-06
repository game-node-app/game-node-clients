import React from "react";

import { Paper, Stack } from "@mantine/core";
import GameInfoReviewEditorView from "@/components/game/info/review/editor/GameInfoReviewEditorView";
import { GameInfoReviewList } from "@repo/ui";

interface IGameInfoReviewViewProps {
  gameId: number;
  targetReviewId?: string;
}

const GameInfoReviewScreen = ({
  gameId,
  targetReviewId,
}: IGameInfoReviewViewProps) => {
  if (!gameId) return null;
  return (
    <Paper w={"100%"} h={"100%"}>
      <Stack w={"100%"} h={"100%"} align={"center"}>
        <GameInfoReviewEditorView gameId={gameId} />
        <GameInfoReviewList gameId={gameId} targetReviewId={targetReviewId} />
      </Stack>
    </Paper>
  );
};

export default GameInfoReviewScreen;
