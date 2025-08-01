import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

interface UseCollectionEntriesForCollectionIdProps {
  collectionId: string;
  limit?: number;
  offset?: number;
  orderBy?: FindCollectionEntriesOrderBy;
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
  const queryKey = ["collection-entries", collectionId, offset, limit, orderBy];
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
          },
        );
      },
      enabled: !!collectionId,
    }),
    queryKey,
    invalidate,
  };
}
