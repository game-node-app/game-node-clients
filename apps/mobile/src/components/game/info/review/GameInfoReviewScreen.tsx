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
        <DetailsBox title={"Your review"}>
          <ReviewListItem review={ownReviewQuery.data} />
        </DetailsBox>
      )}

      <GameInfoReviewList
        gameId={gameId}
        targetReviewId={searchParameters.get("reviewId") ?? undefined}
      />
    </Stack>
  );
};

export default GameInfoReviewScreen;
