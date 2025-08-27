import { useQuery } from "@tanstack/react-query";
import {
  CollectionEntry,
  CollectionsEntriesService,
  FindCollectionEntriesGameFilterDto,
  FindCollectionEntriesOrderBy,
} from "@repo/wrapper/server";

export interface UseCollectionEntriesForUserIdProps {
  userId: string;
  offset?: number;
  limit?: number;
  orderBy?: FindCollectionEntriesOrderBy;
  status?: CollectionEntry.status;
  gameFilters?: FindCollectionEntriesGameFilterDto;
}

export function useCollectionEntriesForUserId({
  userId,
  offset = 0,
  limit = 20,
  orderBy,
  status,
  gameFilters,
}: UseCollectionEntriesForUserIdProps) {
  return useQuery({
    queryKey: [
      "collection-entries",
      "all",
      userId,
      offset,
      limit,
      orderBy,
      gameFilters,
      status,
    ],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
        userId,
        orderBy,
        status,
        gameFilters,
        offset,
        limit,
      );
    },
    enabled: userId != undefined,
  });
}
