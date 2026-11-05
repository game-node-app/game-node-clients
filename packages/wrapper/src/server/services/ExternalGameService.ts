/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindExternalGamesResponseDto } from '../models/FindExternalGamesResponseDto';
import type { FindUnmappedExternalGamesResponseDto } from '../models/FindUnmappedExternalGamesResponseDto';
import type { SubmitExternalGameDto } from '../models/SubmitExternalGameDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExternalGameService {
    /**
     * Any signed-in user may look up exact category + store IDs (`category` with `uids`);
     * the unfiltered catalog listing stays limited to moderators and admins.
     * @param category Lookup: required together with uids.
     * @param uids Lookup: store IDs (1-100, repeated query key), required together with category.
     * @param limit
     * @param offset
     * @returns FindExternalGamesResponseDto
     * @throws ApiError
     */
    public static externalGameControllerFindAllV1(
        category?: 1 | 3 | 5 | 10 | 11 | 13 | 14 | 15 | 20 | 22 | 23 | 26 | 28 | 29 | 30 | 31 | 32 | 36 | 37 | 54 | 55 | 121 | 1001 | 1002,
        uids?: Array<string>,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<FindExternalGamesResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/external',
            query: {
                'category': category,
                'uids': uids,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static externalGameControllerSubmitExternalGameV1(
        requestBody: SubmitExternalGameDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/game/external',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param category
     * @param limit
     * @param offset
     * @returns FindUnmappedExternalGamesResponseDto
     * @throws ApiError
     */
    public static externalGameControllerFindUnmappedEntriesV1(
        category?: 1 | 3 | 5 | 10 | 11 | 13 | 14 | 15 | 20 | 22 | 23 | 26 | 28 | 29 | 30 | 31 | 32 | 36 | 37 | 54 | 55 | 121 | 1001 | 1002,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<FindUnmappedExternalGamesResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/external/unmapped',
            query: {
                'category': category,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static externalGameControllerDismissUnmappedEntryV1(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/game/external/unmapped/{id}/dismiss',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Starts the Epic namespace bulk fill. The fixed jobId makes BullMQ ignore a second
     * trigger while a run is queued or active, and the finished job is removed so the next run can start.
     * @returns any
     * @throws ApiError
     */
    public static externalGameControllerFillEpicNamespacesV1(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/game/external/fill/epic',
        });
    }
}
