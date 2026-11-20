import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  type FindCollectionEntriesForCollectionIdDto,
} from "@repo/wrapper/server";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserId } from "#@/components/auth/hooks/useUserId";

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
  hasCustomCover,
  search,
}: UseCollectionEntriesForCollectionIdProps): ExtendedUseQueryResult<
  CollectionEntriesPaginatedResponseDto | undefined
> {
  const queryClient = useQueryClient();
  const viewerId = useUserId();
  const hasSearch = !!search?.trim();
  const queryKey = [
    "collection-entries",
    collectionId,
    offset,
    limit,
    orderBy,
    status,
    gameFilters,
    ...(hasCustomCover ? [{ hasCustomCover: true }] : []),
    hasSearch ? search : null,
    // Entries of a collection are filtered per viewer (private entries/lists).
    viewerId ?? null,
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
            ...(hasSearch ? { search } : {}),
            ...(hasCustomCover ? { hasCustomCover: true } : {}),
          },
        );
      },
      enabled: !!collectionId,
      placeholderData: keepPreviousData,
    }),
    queryKey,
    invalidate,
  };
}
