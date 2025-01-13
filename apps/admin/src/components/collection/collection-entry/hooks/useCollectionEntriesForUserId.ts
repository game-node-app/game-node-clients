import { useQuery } from "@tanstack/react-query";
import {
    CollectionsEntriesService,
    CollectionsService,
} from "@/wrapper/server";

export default function useCollectionEntriesForUserId(
    userId: string,
    offset = 0,
    limit = 20,
) {
    return useQuery({
        queryKey: ["collection-entries", "all", userId, offset, limit],
        queryFn: async () => {
            return CollectionsEntriesService.collectionsEntriesControllerFindAllByLibraryIdV1(
                userId,
                {},
                offset,
                limit,
            );
        },
    });
}
