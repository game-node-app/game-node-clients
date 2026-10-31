import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  type FindCollectionEntriesForCollectionIdDto,
} from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseCollectionEntriesForCollectionIdProps
  extends FindCollectionEntriesForCollectionIdDto {
  collectionId: string;
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
  status,
  gameFilters,
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
    status,
    gameFilters,
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
        return CollectionsEntriesService.collectionsEntriesControllerFindAllByCollectionIdV1(
          collectionId,
          {
            offset,
            limit,
            orderBy,
            status,
            gameFilters,
          },
        );
      },
      enabled: !!collectionId,
    }),
    queryKey,
    invalidate,
  };
}