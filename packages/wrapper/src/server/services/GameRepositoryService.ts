/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from '../models/Game';
import type { GameExternalStoreDto } from '../models/GameExternalStoreDto';
import type { GameRepositoryFindAllDto } from '../models/GameRepositoryFindAllDto';
import type { GameRepositoryFindOneDto } from '../models/GameRepositoryFindOneDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameRepositoryService {
    /**
     * @param resourceName
     * @returns any
     * @throws ApiError
     */
    public static gameRepositoryControllerGetResourceV1(
        resourceName: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/repository/resource',
            query: {
                'resourceName': resourceName,
            },
        });
    }
    /**
     * @param id
     * @returns string
     * @throws ApiError
     */
    public static gameRepositoryControllerGetIconNamesForPlatformAbbreviationsV1(
        id: number,
    ): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/repository/{id}/platforms/icon',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns GameExternalStoreDto
     * @throws ApiError
     */
    public static gameRepositoryControllerGetExternalStoresForGameIdV1(
        id: number,
    ): CancelablePromise<Array<GameExternalStoreDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/repository/{id}/external-stores',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Game
     * @throws ApiError
     */
    public static gameRepositoryControllerFindOneByIdV1(
        id: number,
        requestBody: GameRepositoryFindOneDto,
    ): CancelablePromise<Game> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/game/repository/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns Game
     * @throws ApiError
     */
    public static gameRepositoryControllerFindAllByIdsV1(
        requestBody: GameRepositoryFindAllDto,
    ): CancelablePromise<Array<Game>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/game/repository',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
