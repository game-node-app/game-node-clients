/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindExternalGamesResponseDto } from '../models/FindExternalGamesResponseDto';
import type { SubmitExternalGameDto } from '../models/SubmitExternalGameDto';
import type { UnmappedExternalGame } from '../models/UnmappedExternalGame';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExternalGameService {
    /**
     * @param limit
     * @param offset
     * @returns FindExternalGamesResponseDto
     * @throws ApiError
     */
    public static externalGameControllerFindAllV1(
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<FindExternalGamesResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/external',
            query: {
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
     * @returns UnmappedExternalGame
     * @throws ApiError
     */
    public static externalGameControllerFindUnmappedEntriesV1(): CancelablePromise<Array<UnmappedExternalGame>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/external/unmapped',
        });
    }
}
