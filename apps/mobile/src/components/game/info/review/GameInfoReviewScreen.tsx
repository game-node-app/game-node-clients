import React from "react";

import { Paper, Stack } from "@mantine/core";
import { DetailsBox } from "@/components/general/DetailsBox";
import {
  ReviewListItem,
  useReviewForUserIdAndGameId,
  useUserId,
} from "@repo/ui";
import GameInfoReviewList from "@/components/game/info/review/GameInfoReviewList";

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
        <Paper className={"w-full"}>
          <DetailsBox title={"Your review"}>
            <ReviewListItem review={ownReviewQuery.data} />
          </DetailsBox>
        </Paper>
      )}

      <Paper className={"w-full"}>
        <GameInfoReviewList gameId={gameId} />
      </Paper>
    </Stack>
  );
};

export default GameInfoReviewScreen;
