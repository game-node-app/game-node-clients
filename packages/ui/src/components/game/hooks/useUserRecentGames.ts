import { useCollectionEntriesForUserId, useGames } from "#@/components";
import { useMemo } from "react";

export function useUserRecentGames(userId: string, offset = 0, limit = 20) {
  const collectionEntriesQuery = useCollectionEntriesForUserId(
    userId,
    offset,
    limit,
    {
      addedDate: "DESC",
    },
  );

  const gameIds = useMemo(() => {
    return collectionEntriesQuery.data?.data?.map((entry) => entry.gameId);
  }, [collectionEntriesQuery]);

  return useGames({
    gameIds: gameIds,
    relations: {
      cover: true,
    },
  });
}
