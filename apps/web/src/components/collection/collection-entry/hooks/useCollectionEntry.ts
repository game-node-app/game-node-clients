import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@/wrapper/server";

export function useCollectionEntry(collectionEntryId: string) {
    return useQuery({
        queryKey: ["collection-entries", collectionEntryId],
        queryFn: async () => {
            return CollectionsEntriesService.collectionsEntriesControllerFindEntryByIdV1(
                collectionEntryId,
            );
        },
    });
}
