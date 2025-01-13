import { CollectionEntry, CollectionsEntriesService } from "@/wrapper/server";

/**
 * Returns a list CollectionEntry entity, given any is available in the current user's library.
 * @param gameId
 */
export async function getOwnCollectionEntryByGameId(
    gameId: number,
): Promise<CollectionEntry | undefined> {
    try {
        return await CollectionsEntriesService.collectionsEntriesControllerFindOwnEntryByGameIdV1(
            gameId,
        );
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
