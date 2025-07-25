import React from "react";

import { Paper, Stack, StackProps } from "@mantine/core";
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
    <Stack w={"100%"} h={"100%"} align={"center"}>
      <GameInfoReviewEditorView gameId={gameId} />
      <GameInfoReviewList gameId={gameId} targetReviewId={targetReviewId} />
    </Stack>
  );
};

export default GameInfoReviewScreen;
