import { useQuery } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@/wrapper/server";

export function useFavoriteCollectionEntriesForUserId(userId: string, offset: number = 0, limit: number = 10) {
    return useQuery({
        queryKey: ["collection-entries", "favorites", userId, offset, limit],
        queryFn: () => {
            return CollectionsEntriesService.collectionsEntriesControllerFindFavoritesByLibraryIdV1(
                userId,
                {},
                offset,
                limit,
            );
        },
        enabled: userId != undefined,
    });
}
