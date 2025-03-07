import React from "react";
import { GameView } from "#@/components/game/view/GameView";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { GameViewContentProps } from "#@/components";
import { useUserRecentGames } from "#@/components/game/hooks/useUserRecentGames.ts";

interface Props extends Omit<GameViewContentProps, "items"> {
  userId: string;
  offset?: number;
  limit?: number;
}

const RecentCollectionEntriesView = ({
  userId,
  offset = 0,
  limit = 12,
  ...others
}: Props) => {
  const gamesQuery = useUserRecentGames(userId, offset, limit);

  if (gamesQuery.isLoading) {
    return <CenteredLoading message={"Fetching games..."} />;
  }
  return (
    <GameView layout={"grid"}>
      <GameView.Content {...others} items={gamesQuery.data} />
    </GameView>
  );
};

export { RecentCollectionEntriesView };
