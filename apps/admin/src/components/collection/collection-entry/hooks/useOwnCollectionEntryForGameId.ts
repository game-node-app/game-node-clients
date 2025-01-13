import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CollectionEntry } from "@/wrapper/server";
import { getOwnCollectionEntryByGameId } from "@/components/collection/collection-entry/util/getOwnCollectionEntryByGameId";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

/**
 * Returns a collection entry for the current user based on a game ID.
 * The collection entry will be undefined if the user doesn't have the game in their library.
 * @param gameId
 */
export function useOwnCollectionEntryForGameId(
    gameId: number | undefined,
): ExtendedUseQueryResult<CollectionEntry | undefined> {
    const queryClient = useQueryClient();
    const queryKey = ["collection-entries", "own", gameId];
    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 2) });
    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                if (!gameId) return null;
                try {
                    const collectionEntry =
                        await getOwnCollectionEntryByGameId(gameId);
                    if (!collectionEntry) return null;
                    return collectionEntry;
                } catch (e) {
                    return null;
                }
            },
            enabled: gameId != undefined,
        }),
        queryKey,
        invalidate,
    };
}
