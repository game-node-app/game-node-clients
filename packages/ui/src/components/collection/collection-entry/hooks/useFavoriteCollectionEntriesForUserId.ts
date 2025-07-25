import { useQuery } from "@tanstack/react-query";
import {
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";

export function useFavoriteCollectionEntriesForUserId(
  userId: string,
  offset?: number,
  limit?: number,
  orderBy?: FindCollectionEntriesOrderBy,
) {
  return useQuery({
    queryKey: [
      "collection-entries",
      "favorites",
      userId,
      offset,
      limit,
      orderBy,
    ],
    queryFn: () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindFavoritesByLibraryIdV1(
        userId,
        orderBy,
        undefined,
        undefined,
        offset,
        limit,
      );
    },
  });
}
