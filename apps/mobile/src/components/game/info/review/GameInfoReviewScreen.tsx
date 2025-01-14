import React from "react";

import { Paper, Stack } from "@mantine/core";
import GameInfoReviewEditorView from "@/components/game/info/review/editor/GameInfoReviewEditorView";
import GameInfoReviewList from "@/components/game/info/review/GameInfoReviewList";
import useReviewForUserIdAndGameId from "@/components/review/hooks/useReviewForUserIdAndGameId";
import useUserId from "@/components/auth/hooks/useUserId";
import ReviewListItem from "@/components/review/view/ReviewListItem";
import { DetailsBox } from "@/components/general/DetailsBox";

interface IGameInfoReviewViewProps {
    gameId: number;
}

const GameInfoReviewScreen = ({ gameId }: IGameInfoReviewViewProps) => {
    const userId = useUserId();
    const ownReviewQuery = useReviewForUserIdAndGameId(userId, gameId);

    if (!gameId) return null;
    return (
        <Stack w={"100%"} h={"100%"} align={"center"}>
            {ownReviewQuery.data && (
                <Paper className={"max-w-[92vw] w-full"}>
                    <DetailsBox title={"Your review"}>
                        <ReviewListItem review={ownReviewQuery.data} />
                    </DetailsBox>
                </Paper>
            )}

            <Paper className={"max-w-[92vw] w-full"}>
                <GameInfoReviewList gameId={gameId} />
            </Paper>
        </Stack>
    );
};

export default GameInfoReviewScreen;
