import type { Collection } from '../models/Collection';
import type { CreateCollectionDto } from '../models/CreateCollectionDto';
import type { UpdateCollectionDto } from '../models/UpdateCollectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class CollectionsService {
    /**
     * Returns a collection which the user has access to
     *
     * (Either its own collection or a public one)
     * @param id
     * @returns Collection
     * @throws ApiError
     */
    static collectionsControllerFindOneByIdWithPermissionsV1(id: string): CancelablePromise<Collection>;
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static collectionsControllerUpdateV1(id: string, requestBody: UpdateCollectionDto): CancelablePromise<Record<string, any>>;
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    static collectionsControllerDeleteV1(id: string): CancelablePromise<void>;
    /**
     * @param userId
     * @returns Collection
     * @throws ApiError
     */
    static collectionsControllerFindAllByUserIdWithPermissionsV1(userId: string): CancelablePromise<Array<Collection>>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static collectionsControllerCreateV1(requestBody: CreateCollectionDto): CancelablePromise<any>;
}
//# sourceMappingURL=CollectionsService.d.ts.map