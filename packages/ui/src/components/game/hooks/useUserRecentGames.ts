import { useCollectionEntriesForUserId, useGames } from "#@/components";
import { GameCoverArg } from "#@/components/game/util/gameCoverRequest";
import { useMemo } from "react";

export function useUserRecentGames(
  userId: string,
  offset = 0,
  limit = 20,
  cover?: GameCoverArg,
) {
  const collectionEntriesQuery = useCollectionEntriesForUserId({
    userId,
    offset,
    limit,
    orderBy: {
      addedDate: "DESC",
    },
  });

  const gameIds = useMemo(() => {
    return collectionEntriesQuery.data?.data?.map((entry) => entry.gameId);
  }, [collectionEntriesQuery]);

  const gamesQuery = useGames(
    {
      gameIds: gameIds,
      relations: {
        cover: true,
      },
    },
    false,
    cover,
  );

  return {
    ...gamesQuery,
    isLoading: gamesQuery.isLoading || collectionEntriesQuery.isLoading,
    isError: gamesQuery.isError || collectionEntriesQuery.isError,
    isFetching: gamesQuery.isFetching || collectionEntriesQuery.isFetching,
  };
}
