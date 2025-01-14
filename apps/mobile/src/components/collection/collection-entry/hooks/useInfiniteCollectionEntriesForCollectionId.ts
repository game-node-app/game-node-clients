import { ExtendedUseInfiniteQueryResult } from "@/util/types/ExtendedUseQueryResult";
import { CollectionEntriesPaginatedResponseDto, CollectionsEntriesService } from "@/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

interface UseInfiniteCollectionEntriesForCollectionIdProps {
    collectionId: string;
    limit?: number;
    orderBy?: Record<string, unknown>;
}

export function useInfiniteCollectionEntriesForCollectionId({
    collectionId,
    limit,
    orderBy,
}: UseInfiniteCollectionEntriesForCollectionIdProps): ExtendedUseInfiniteQueryResult<
    CollectionEntriesPaginatedResponseDto | undefined
> {
    const limitToUse = limit || 12;
    const queryClient = useQueryClient();
    const queryKey = ["collection-entries", "infinite", collectionId, limit, orderBy];
    /**
     * This will also invalidate useCollectionEntriesForCollectionId
     */
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: [queryKey[0]],
        });
    };

    return {
        queryKey,
        invalidate,
        ...useInfiniteQuery({
            queryKey: queryKey,
            queryFn: async ({ pageParam }) => {
                return CollectionsEntriesService.collectionsEntriesControllerFindAllByCollectionIdV1(collectionId, {
                    limit,
                    orderBy,
                    offset: pageParam,
                });
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage, _, lastPageParam) => {
                if (lastPage && lastPage.pagination && lastPage.pagination.hasNextPage) {
                    return lastPageParam + limitToUse;
                }

                return undefined;
            },
        }),
    };
}
