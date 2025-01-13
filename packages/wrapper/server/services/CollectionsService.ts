/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from '../models/Collection';
import type { CreateCollectionDto } from '../models/CreateCollectionDto';
import type { UpdateCollectionDto } from '../models/UpdateCollectionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CollectionsService {
    /**
     * Returns a collection which the user has access to
     *
     * (Either its own collection or a public one)
     * @param id
     * @returns Collection
     * @throws ApiError
     */
    public static collectionsControllerFindOneByIdWithPermissionsV1(
        id: string,
    ): CancelablePromise<Collection> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static collectionsControllerUpdateV1(
        id: string,
        requestBody: UpdateCollectionDto,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/collections/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static collectionsControllerDeleteV1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/collections/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param userId
     * @returns Collection
     * @throws ApiError
     */
    public static collectionsControllerFindAllByUserIdWithPermissionsV1(
        userId: string,
    ): CancelablePromise<Array<Collection>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections/library/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static collectionsControllerCreateV1(
        requestBody: CreateCollectionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/collections',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
