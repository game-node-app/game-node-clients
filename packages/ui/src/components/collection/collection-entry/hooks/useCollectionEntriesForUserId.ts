import { useQuery } from "@tanstack/react-query";
import {
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";

export function useCollectionEntriesForUserId(
  userId: string,
  offset = 0,
  limit = 20,
  orderBy?: FindCollectionEntriesOrderBy,
) {
  return useQuery({
    queryKey: ["collection-entries", "all", userId, offset, limit, orderBy],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
        userId,
        orderBy,
        offset,
        limit,
      );
    },
    enabled: userId != undefined,
  });
}
