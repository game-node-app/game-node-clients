import type { CollectionEntriesPaginatedResponseDto } from '../models/CollectionEntriesPaginatedResponseDto';
import type { CollectionEntry } from '../models/CollectionEntry';
import type { CreateFavoriteStatusCollectionEntryDto } from '../models/CreateFavoriteStatusCollectionEntryDto';
import type { CreateUpdateCollectionEntryDto } from '../models/CreateUpdateCollectionEntryDto';
import type { FindCollectionEntriesForCollectionIdDto } from '../models/FindCollectionEntriesForCollectionIdDto';
import type { FindCollectionEntriesOrderBy } from '../models/FindCollectionEntriesOrderBy';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class CollectionsEntriesService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static collectionsEntriesControllerCreateOrUpdateV1(requestBody: CreateUpdateCollectionEntryDto): CancelablePromise<any>;
    /**
     * @param id
     * @returns CollectionEntry
     * @throws ApiError
     */
    static collectionsEntriesControllerFindEntryByIdV1(id: string): CancelablePromise<CollectionEntry>;
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    static collectionsEntriesControllerDeleteOwnEntryV1(id: string): CancelablePromise<void>;
    /**
     * Returns a specific collection entry based on game ID
     * @param id
     * @returns CollectionEntry
     * @throws ApiError
     */
    static collectionsEntriesControllerFindOwnEntryByGameIdV1(id: number): CancelablePromise<CollectionEntry>;
    /**
     * @param id
     * @returns string
     * @throws ApiError
     */
    static collectionsEntriesControllerGetIconsForOwnedPlatformsV1(id: string): CancelablePromise<Array<string>>;
    /**
     * @param id
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    static collectionsEntriesControllerChangeFavoriteStatusV1(id: number, requestBody: CreateFavoriteStatusCollectionEntryDto): CancelablePromise<void>;
    /**
     * @param id
     * @param orderBy
     * @param offset
     * @param limit
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    static collectionsEntriesControllerFindAllByLibraryIdV1(id: string, orderBy?: FindCollectionEntriesOrderBy, offset?: number, limit?: number): CancelablePromise<CollectionEntriesPaginatedResponseDto>;
    /**
     * @param id
     * @param orderBy
     * @param offset
     * @param limit
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    static collectionsEntriesControllerFindFavoritesByLibraryIdV1(id: string, orderBy?: FindCollectionEntriesOrderBy, offset?: number, limit?: number): CancelablePromise<CollectionEntriesPaginatedResponseDto>;
    /**
     * @param id
     * @param requestBody
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    static collectionsEntriesControllerFindAllByCollectionIdV1(id: string, requestBody: FindCollectionEntriesForCollectionIdDto): CancelablePromise<CollectionEntriesPaginatedResponseDto>;
}
//# sourceMappingURL=CollectionsEntriesService.d.ts.map