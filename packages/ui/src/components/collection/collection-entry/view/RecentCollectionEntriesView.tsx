import { GameViewContentProps } from "#@/components";
import { useUserRecentGames } from "#@/components/game/hooks/useUserRecentGames.ts";
import { GameView } from "#@/components/game/view/GameView";

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

  return (
    <GameView layout={"grid"}>
      <GameView.Content {...others} items={gamesQuery.data}>
        <GameView.LoadingSkeletons isVisible={gamesQuery.isLoading} />
      </GameView.Content>
    </GameView>
  );
};

export { RecentCollectionEntriesView };