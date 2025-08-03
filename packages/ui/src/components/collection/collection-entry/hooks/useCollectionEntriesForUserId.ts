import { useQuery } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";

interface Props {
  userId: string;
  offset?: number;
  limit?: number;
  orderBy?: FindCollectionEntriesOrderBy;
  status?: CollectionEntry.status;
}

export function useCollectionEntriesForUserId({
  userId,
  offset = 0,
  limit = 20,
  orderBy,
  status,
}: Props) {
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
