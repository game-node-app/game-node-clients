import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util";

export function useFavoriteCollectionEntriesForUserId(
  userId: string | undefined,
  offset?: number,
  limit?: number,
  orderBy?: FindCollectionEntriesOrderBy,
): ExtendedUseQueryResult<CollectionEntriesPaginatedResponseDto> {
  const queryClient = useQueryClient();
  const queryKey = [
    "collection-entries",
    "favorites",
    userId,
    offset,
    limit,
    orderBy,
  ];

  const invalidate = () => {
    return queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });
  };

  return {
    ...useQuery({
      queryKey,
      queryFn: () => {
        return CollectionsEntriesService.collectionsEntriesControllerFindFavoritesByLibraryIdV1(
          userId!,
          orderBy,
          undefined,
          undefined,
          offset,
          limit,
        );
      },
      enabled: !!userId,
    }),
    invalidate,
    queryKey,
  };
}
