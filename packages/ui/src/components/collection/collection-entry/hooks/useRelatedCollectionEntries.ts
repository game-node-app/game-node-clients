import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";

export function useRelatedCollectionEntries(collectionEntryId: string) {
  const viewerId = useUserId();
  return useQuery({
    queryKey: [
      "collection-entries",
      "related",
      collectionEntryId,
      viewerId ?? null,
    ],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindRelatedEntriesV1(
        collectionEntryId,
      );
    },
    enabled: !!collectionEntryId,
    // Hidden related entries answer 404 (or are omitted): don't retry.
    retry: false,
  });
}
