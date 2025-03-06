import React from "react";
import { CenteredLoading, GameSelectView } from "#@/components";
import { useUserRecentGames } from "#@/components/game/hooks/useUserRecentGames.ts";

interface Props {
  userId: string;
  onSelected: (gameId: number) => void;
}

const GameSearchSuggestions = ({ userId, onSelected }: Props) => {
  const recentGamesQuery = useUserRecentGames(userId, 0, 12);

  if (recentGamesQuery.isLoading) {
    return <CenteredLoading />;
  } else if (recentGamesQuery.data == undefined) {
    return null;
  }

  return (
    <GameSelectView>
      <GameSelectView.Content
        items={recentGamesQuery.data}
        onSelected={onSelected}
        checkIsSelected={() => false}
        excludeItemsInLibrary={false}
      />
    </GameSelectView>
  );
};

export { GameSearchSuggestions };
