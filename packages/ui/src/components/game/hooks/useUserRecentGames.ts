import {
  TGameOrSearchGame,
  useCollectionEntriesForUserId,
  useGames,
  useUserId,
} from "#@/components";
import { toLibraryVisibilityLevel } from "#@/components/collection/collection-entry/visibility/LibraryVisibilityLevel";
import { GameCoverArg } from "#@/components/game/util/gameCoverRequest";
import { useMemo } from "react";

export function useUserRecentGames(
  userId: string,
  offset = 0,
  limit = 20,
  cover?: GameCoverArg,
) {
  const viewerId = useUserId();
  // Same rule as the library and collection listings: the entry level only
  // reaches the rendered items for the owner, never for another viewer.
  const isOwner = viewerId != undefined && viewerId === userId;

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

  const games = useMemo<TGameOrSearchGame[] | undefined>(() => {
    if (gamesQuery.data == undefined) {
      return undefined;
    }

    if (!isOwner) {
      return gamesQuery.data;
    }

    const entries = collectionEntriesQuery.data?.data;

    return gamesQuery.data.map((game) => {
      const relatedCollectionEntry = entries?.find(
        (entry) => entry.gameId === game.id,
      );

      return {
        ...game,
        // Owner-only badge: never expose another user's entry level.
        visibility: toLibraryVisibilityLevel(
          relatedCollectionEntry?.visibility,
        ),
      };
    });
  }, [collectionEntriesQuery.data?.data, gamesQuery.data, isOwner]);

  return {
    ...gamesQuery,
    data: games,
    isLoading: gamesQuery.isLoading || collectionEntriesQuery.isLoading,
    isError: gamesQuery.isError || collectionEntriesQuery.isError,
    isFetching: gamesQuery.isFetching || collectionEntriesQuery.isFetching,
  };
}
