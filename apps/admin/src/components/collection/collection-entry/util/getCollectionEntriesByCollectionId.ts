import {
    CollectionEntriesPaginatedResponseDto,
    CollectionsEntriesService,
} from "@/wrapper/server";

/**
 * Returns a list CollectionEntry entity, given any is available in the user's library for that
 * specific collection id.
 * @param collectionId
 * @param offset
 * @param limit
 * @param orderBy
 */
export async function getCollectionEntriesByCollectionId(
    collectionId: string,
    offset?: number,
    limit?: number,
    orderBy?: Record<string, any>,
): Promise<CollectionEntriesPaginatedResponseDto | undefined> {
    try {
        return await CollectionsEntriesService.collectionsEntriesControllerFindAllByCollectionIdV1(
            collectionId,
            {
                offset,
                limit,
                orderBy,
            },
        );
    } catch (e) {
        console.error(e);
        return undefined;
    }
}
