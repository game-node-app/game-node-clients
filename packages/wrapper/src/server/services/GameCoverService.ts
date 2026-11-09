/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameCoverChoiceResponseDto } from '../models/GameCoverChoiceResponseDto';
import type { GameCoverOptionResponseDto } from '../models/GameCoverOptionResponseDto';
import type { SetGameCoverChoiceDto } from '../models/SetGameCoverChoiceDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameCoverService {
    /**
     * @param gameId
     * @returns GameCoverOptionResponseDto
     * @throws ApiError
     */
    public static gameCoverControllerFindOptionsV1(
        gameId: number,
    ): CancelablePromise<Array<GameCoverOptionResponseDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/cover/{gameId}/options',
            path: {
                'gameId': gameId,
            },
        });
    }
    /**
     * @param gameId
     * @returns GameCoverChoiceResponseDto
     * @throws ApiError
     */
    public static gameCoverControllerFindMineV1(
        gameId: number,
    ): CancelablePromise<GameCoverChoiceResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/cover/{gameId}/mine',
            path: {
                'gameId': gameId,
            },
        });
    }
    /**
     * @param gameId
     * @param requestBody
     * @returns GameCoverChoiceResponseDto
     * @throws ApiError
     */
    public static gameCoverControllerSetMineV1(
        gameId: number,
        requestBody: SetGameCoverChoiceDto,
    ): CancelablePromise<GameCoverChoiceResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/game/cover/{gameId}/mine',
            path: {
                'gameId': gameId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param gameId
     * @returns any
     * @throws ApiError
     */
    public static gameCoverControllerRemoveMineV1(
        gameId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/game/cover/{gameId}/mine',
            path: {
                'gameId': gameId,
            },
        });
    }
}
