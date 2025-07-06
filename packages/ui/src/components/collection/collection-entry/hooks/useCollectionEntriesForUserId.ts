import { useQuery } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";

export function useCollectionEntriesForUserId(
  userId: string,
  offset = 0,
  limit = 20,
  orderBy?: FindCollectionEntriesOrderBy,
  status?: CollectionEntry.status,
) {
  return useQuery({
    queryKey: [
      "collection-entries",
      "all",
      userId,
      offset,
      limit,
      orderBy,
      status,
    ],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
        userId,
        orderBy,
        status,
        undefined,
        offset,
        limit,
      );
    },
    enabled: userId != undefined,
  });
}
