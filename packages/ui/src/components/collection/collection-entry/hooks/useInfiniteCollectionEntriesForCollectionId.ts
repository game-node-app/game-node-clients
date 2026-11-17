import { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";

interface UseInfiniteCollectionEntriesForCollectionIdProps {
  collectionId: string;
  limit?: number;
  orderBy?: FindCollectionEntriesOrderBy;
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
  const viewerId = useUserId();
  const queryKey = [
    "collection-entries",
    "infinite",
    collectionId,
    limit,
    orderBy,
    // Entries of a collection are filtered per viewer.
    viewerId ?? null,
  ];
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
        return CollectionsEntriesService.collectionsEntriesControllerFindAllByCollectionIdV1(
          collectionId,
          {
            limit,
            orderBy,
            offset: pageParam,
          },
        );
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, _, lastPageParam) => {
        if (
          lastPage &&
          lastPage.pagination &&
          lastPage.pagination.hasNextPage
        ) {
          return lastPageParam + limitToUse;
        }

        return undefined;
      },
    }),
  };
}
