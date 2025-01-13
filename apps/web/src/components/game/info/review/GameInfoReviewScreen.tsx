import React from "react";

import { Paper, Stack } from "@mantine/core";
import GameInfoReviewEditorView from "@/components/game/info/review/editor/GameInfoReviewEditorView";
import GameInfoReviewList from "@/components/game/info/review/GameInfoReviewList";

interface IGameInfoReviewViewProps {
    gameId: number;
}

const GameInfoReviewScreen = ({ gameId }: IGameInfoReviewViewProps) => {
    if (!gameId) return null;
    return (
        <Paper w={"100%"} h={"100%"}>
            <Stack w={"100%"} h={"100%"} align={"center"}>
                <GameInfoReviewEditorView gameId={gameId} />
                <GameInfoReviewList gameId={gameId} />
            </Stack>
        </Paper>
    );
};

export default GameInfoReviewScreen;
