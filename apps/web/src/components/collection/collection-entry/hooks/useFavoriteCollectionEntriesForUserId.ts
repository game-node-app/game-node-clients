import { useQuery } from "@tanstack/react-query";
import {
    CollectionsEntriesService,
    FindCollectionEntriesOrderBy,
} from "@/wrapper/server";

export function useFavoriteCollectionEntriesForUserId(
    userId: string,
    offset?: number,
    limit?: number,
    orderBy?: FindCollectionEntriesOrderBy,
) {
    return useQuery({
        queryKey: ["collection-entries", "favorites", userId],
        queryFn: () => {
            return CollectionsEntriesService.collectionsEntriesControllerFindFavoritesByLibraryIdV1(
                userId,
                orderBy,
                offset,
                limit,
            );
        },
    });
}
