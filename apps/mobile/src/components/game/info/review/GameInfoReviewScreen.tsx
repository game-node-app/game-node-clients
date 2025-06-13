import React from "react";

import { Paper, Stack } from "@mantine/core";
import {
  DetailsBox,
  GameInfoReviewList,
  ReviewListItem,
  useReviewForUserIdAndGameId,
  useUserId,
} from "@repo/ui";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";

interface IGameInfoReviewViewProps {
  gameId: number;
}

const GameInfoReviewScreen = ({ gameId }: IGameInfoReviewViewProps) => {
  const userId = useUserId();
  const ownReviewQuery = useReviewForUserIdAndGameId(userId, gameId);
  const searchParameters = useSearchParameters();

  if (!gameId) return null;
  return (
    <Stack w={"100%"} h={"100%"} align={"center"}>
      {ownReviewQuery.data && (
        <Paper className={"w-full"}>
          <DetailsBox
            title={"Your review"}
            stackProps={{
              className: "p-3",
            }}
          >
            <ReviewListItem review={ownReviewQuery.data} />
          </DetailsBox>
        </Paper>
      )}

      <Paper className={"w-full"}>
        <GameInfoReviewList
          gameId={gameId}
          targetReviewId={searchParameters.get("reviewId") ?? undefined}
        />
      </Paper>
    </Stack>
  );
};

export default GameInfoReviewScreen;
