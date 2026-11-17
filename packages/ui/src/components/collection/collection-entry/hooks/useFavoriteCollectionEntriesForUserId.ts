import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CollectionEntriesPaginatedResponseDto,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useFavoriteCollectionEntriesForUserId(
  userId: string | undefined,
  offset?: number,
  limit?: number,
  orderBy?: FindCollectionEntriesOrderBy,
  hasCustomCover?: boolean,
): ExtendedUseQueryResult<CollectionEntriesPaginatedResponseDto> {
  const queryClient = useQueryClient();
  const viewerId = useUserId();
  const queryKey = [
    "collection-entries",
    "favorites",
    userId,
    offset,
    limit,
    orderBy,
    ...(hasCustomCover ? [{ hasCustomCover: true }] : []),
    // Favorites are filtered per viewer, so the viewer id belongs to the key.
    viewerId ?? null,
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
          hasCustomCover ? true : undefined,
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
