/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionEntriesPaginatedResponseDto } from '../models/CollectionEntriesPaginatedResponseDto';
import type { CollectionEntry } from '../models/CollectionEntry';
import type { CreateFavoriteStatusCollectionEntryDto } from '../models/CreateFavoriteStatusCollectionEntryDto';
import type { CreateUpdateCollectionEntryDto } from '../models/CreateUpdateCollectionEntryDto';
import type { FindCollectionEntriesForCollectionIdDto } from '../models/FindCollectionEntriesForCollectionIdDto';
import type { FindCollectionEntriesOrderBy } from '../models/FindCollectionEntriesOrderBy';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CollectionsEntriesService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static collectionsEntriesControllerCreateOrUpdateV1(
        requestBody: CreateUpdateCollectionEntryDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/collections-entries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns CollectionEntry
     * @throws ApiError
     */
    public static collectionsEntriesControllerFindEntryByIdV1(
        id: string,
    ): CancelablePromise<CollectionEntry> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections-entries/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static collectionsEntriesControllerDeleteOwnEntryV1(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/collections-entries/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Returns a specific collection entry based on game ID
     * @param id
     * @returns CollectionEntry
     * @throws ApiError
     */
    public static collectionsEntriesControllerFindOwnEntryByGameIdV1(
        id: number,
    ): CancelablePromise<CollectionEntry> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections-entries/game/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid query`,
            },
        });
    }
    /**
     * @param id
     * @returns string
     * @throws ApiError
     */
    public static collectionsEntriesControllerGetIconsForOwnedPlatformsV1(
        id: string,
    ): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections-entries/{id}/platforms/icons',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static collectionsEntriesControllerChangeFavoriteStatusV1(
        id: number,
        requestBody: CreateFavoriteStatusCollectionEntryDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/collections-entries/game/{id}/favorite',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param orderBy
     * @param offset
     * @param limit
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    public static collectionsEntriesControllerFindAllByLibraryIdV1(
        id: string,
        orderBy?: FindCollectionEntriesOrderBy,
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<CollectionEntriesPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections-entries/library/{id}',
            path: {
                'id': id,
            },
            query: {
                'orderBy': orderBy,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param id
     * @param orderBy
     * @param offset
     * @param limit
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    public static collectionsEntriesControllerFindFavoritesByLibraryIdV1(
        id: string,
        orderBy?: FindCollectionEntriesOrderBy,
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<CollectionEntriesPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/collections-entries/library/{id}/favorites',
            path: {
                'id': id,
            },
            query: {
                'orderBy': orderBy,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns CollectionEntriesPaginatedResponseDto
     * @throws ApiError
     */
    public static collectionsEntriesControllerFindAllByCollectionIdV1(
        id: string,
        requestBody: FindCollectionEntriesForCollectionIdDto,
    ): CancelablePromise<CollectionEntriesPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/collections-entries/collection/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
