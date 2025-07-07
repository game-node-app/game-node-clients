/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameTimeToBeatDto } from '../models/GameTimeToBeatDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PlaytimeTtbService {
    /**
     * Returns time to beat information for one game, if available.
     * @param gameId
     * @returns GameTimeToBeatDto
     * @throws ApiError
     */
    public static timeToBeatControllerFindOneForGameIdV1(
        gameId: number,
    ): CancelablePromise<GameTimeToBeatDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/playtime/ttb/{gameId}',
            path: {
                'gameId': gameId,
            },
        });
    }
    /**
     * Returns time to beat information for each gameId, if available.
     * @param gameIds
     * @returns GameTimeToBeatDto
     * @throws ApiError
     */
    public static timeToBeatControllerFindAllForGameIdV1(
        gameIds: Array<number>,
    ): CancelablePromise<Array<GameTimeToBeatDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/playtime/ttb',
            query: {
                'gameIds': gameIds,
            },
        });
    }
}
