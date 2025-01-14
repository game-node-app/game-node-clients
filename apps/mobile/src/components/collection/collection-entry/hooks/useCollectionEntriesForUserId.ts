import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService, type FindCollectionEntriesOrderBy } from "@/wrapper/server";

export default function useCollectionEntriesForUserId(
    userId: string,
    offset = 0,
    limit = 20,
    orderBy: FindCollectionEntriesOrderBy = {
        addedDate: "DESC",
    },
) {
    return useQuery({
        queryKey: ["collection-entries", "all", userId, offset, limit],
        queryFn: async () => {
            return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
                userId,
                orderBy,
                offset,
                limit,
            );
        },
    });
}
