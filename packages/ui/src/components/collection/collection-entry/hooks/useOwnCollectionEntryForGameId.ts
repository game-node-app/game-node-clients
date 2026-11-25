import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  CollectionEntry,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { createBatchLoader } from "#@/util/createBatchLoader";

async function findOwnEntry(gameId: number): Promise<CollectionEntry | null> {
  try {
    return await CollectionsEntriesService.collectionsEntriesControllerFindOwnEntryByGameIdV1(
      gameId,
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Lists with a library badge per game (release strip, game grids) read every
 * game's entry at once through `POST /v1/collections-entries/own`. Games not in
 * the library are left out of its answer, so they resolve to `null`. The user
 * id only groups the batch.
 */
const loadOwnEntry = createBatchLoader<
  number,
  CollectionEntry | null,
  string
>({
  fetchMany: (gameIds) =>
    CollectionsEntriesService.collectionsEntriesControllerFindOwnEntriesByGameIdsV1(
      { gameIds },
    ),
  fetchOne: (gameId) => findOwnEntry(gameId),
  resolveMissing: () => null,
  getId: (entry) => entry!.gameId,
  maxBatchSize: 200,
});

/**
 * Returns a collection entry for the current user based on a game ID.
 * The collection entry will be undefined if the user doesn't have the game in their library.
 * @param gameId
 * @param enabled
 */
export function useOwnCollectionEntryForGameId(
  gameId: number | undefined,
  enabled = true,
): ExtendedUseQueryResult<CollectionEntry | null> {
  const queryClient = useQueryClient();
  // Signed-out visitors have no library: the request could only answer 401.
  const userId = useUserId();
  const queryKey = ["collection-entries", "own", gameId];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 2) });
  return {
    ...useQuery({
      queryKey,
      queryFn: () => loadOwnEntry(gameId!, userId!),
      enabled: enabled && !!userId && gameId != undefined,
    }),
    queryKey,
    invalidate,
  };
}
