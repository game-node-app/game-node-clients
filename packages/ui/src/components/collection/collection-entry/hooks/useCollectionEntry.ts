import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService } from "../../../../../../wrapper/src/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { retryUnlessHidden } from "#@/util";

export function useCollectionEntry(
  collectionEntryId: string | undefined | null,
  options?: { enabled?: boolean },
) {
  const viewerId = useUserId();
  return useQuery({
    queryKey: [
      "collection-entries",
      collectionEntryId ?? null,
      viewerId ?? null,
    ],
    queryFn: async () => {
      return CollectionsEntriesService.collectionsEntriesControllerFindEntryByIdV1(
        collectionEntryId!,
      );
    },
    enabled: (options?.enabled ?? true) && !!collectionEntryId,
    // Hidden entries answer 404: render the empty state, don't retry.
    retry: retryUnlessHidden,
  });
}
