import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  CollectionEntry,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

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
  const queryKey = ["collection-entries", "own", gameId];
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 2) });
  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        try {
          return await CollectionsEntriesService.collectionsEntriesControllerFindOwnEntryByGameIdV1(
            gameId!,
          );
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            return null;
          }

          throw err;
        }
      },
      enabled: enabled && gameId != undefined,
    }),
    queryKey,
    invalidate,
  };
}
