import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@repo/wrapper/server";

export function useRelatedCollectionEntries(collectionEntryId: string) {
  return useQuery({
    queryKey: ["collection-entries", "related", collectionEntryId],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindRelatedEntriesV1(
        collectionEntryId,
      );
    },
  });
}
