import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { CollectionEntriesPaginatedResponseDto } from "@/wrapper/server";
import { getCollectionEntriesByCollectionId } from "@/components/collection/collection-entry/util/getCollectionEntriesByCollectionId";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";

interface UseCollectionEntriesForCollectionIdProps {
    collectionId: string;
    limit?: number;
    offset?: number;
    orderBy?: Record<string, any>;
}

/**
 * Returns a list of collection entries for the current user based on a collection id.
 * Automatically aggregates games.
 * @param collectionId
 * @param limit
 * @param offset
 * @param gameRelations
 */
export function useCollectionEntriesForCollectionId({
    collectionId,
    limit,
    offset,
    orderBy,
}: UseCollectionEntriesForCollectionIdProps): ExtendedUseQueryResult<
    CollectionEntriesPaginatedResponseDto | undefined
> {
    const queryClient = useQueryClient();
    const queryKey = [
        "collection-entries",
        collectionId,
        offset,
        limit,
        orderBy,
    ];
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: [queryKey[0]],
        });
    };
    return {
        ...useQuery({
            queryKey,
            queryFn: async () => {
                if (!collectionId) {
                    return undefined;
                }
                return await getCollectionEntriesByCollectionId(
                    collectionId,
                    offset,
                    limit,
                    orderBy,
                );
            },
            enabled: !!collectionId,
        }),
        queryKey,
        invalidate,
    };
}
