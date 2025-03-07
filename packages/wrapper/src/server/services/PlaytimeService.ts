/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindAllPlaytimeResponseDto } from '../models/FindAllPlaytimeResponseDto';
import type { Object } from '../models/Object';
import type { UserCumulativePlaytimeDto } from '../models/UserCumulativePlaytimeDto';
import type { UserPlaytime } from '../models/UserPlaytime';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PlaytimeService {
    /**
     * @param gameId
     * @param userId
     * @returns UserCumulativePlaytimeDto
     * @throws ApiError
     */
    public static playtimeControllerFindAccumulatedForUserIdAndGameIdV1(
        gameId: number,
        userId: string,
    ): CancelablePromise<UserCumulativePlaytimeDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/playtime/user/{userId}/{gameId}/accumulated',
            path: {
                'gameId': gameId,
                'userId': userId,
            },
        });
    }
    /**
     * @param gameId
     * @param userId
     * @returns UserPlaytime
     * @throws ApiError
     */
    public static playtimeControllerFindAllByUserIdAndGameIdV1(
        gameId: number,
        userId: string,
    ): CancelablePromise<Array<UserPlaytime>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/playtime/user/{userId}/{gameId}',
            path: {
                'gameId': gameId,
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param onlyLatest If only entries from the last 3 months should be returned.
     * @param offset
     * @param limit
     * @param orderBy
     * @returns FindAllPlaytimeResponseDto
     * @throws ApiError
     */
    public static playtimeControllerFindAllByUserIdV1(
        userId: string,
        onlyLatest?: Object,
        offset?: number,
        limit: number = 20,
        orderBy?: Object,
    ): CancelablePromise<FindAllPlaytimeResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/playtime/user/{userId}',
            path: {
                'userId': userId,
            },
            query: {
                'onlyLatest': onlyLatest,
                'offset': offset,
                'limit': limit,
                'orderBy': orderBy,
            },
        });
    }
}
