/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAchievementDto } from '../models/GameAchievementDto';
import type { GameObtainedAchievementDto } from '../models/GameObtainedAchievementDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GameAchievementService {
    /**
     * @param externalGameId
     * @returns GameAchievementDto
     * @throws ApiError
     */
    public static gameAchievementControllerFindAllByExternalGameIdV1(
        externalGameId: number,
    ): CancelablePromise<Array<GameAchievementDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/achievement/{externalGameId}',
            path: {
                'externalGameId': externalGameId,
            },
        });
    }
    /**
     * @param externalGameId
     * @returns GameObtainedAchievementDto
     * @throws ApiError
     */
    public static gameAchievementControllerFindAllObtainedByExternalGameIdV1(
        externalGameId: number,
    ): CancelablePromise<Array<GameObtainedAchievementDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/achievement/{externalGameId}/obtained',
            path: {
                'externalGameId': externalGameId,
            },
        });
    }
    /**
     * @param externalGameId
     * @param externalAchievementId
     * @returns GameAchievementDto
     * @throws ApiError
     */
    public static gameAchievementControllerFindOneByExternalGameIdV1(
        externalGameId: number,
        externalAchievementId: string,
    ): CancelablePromise<GameAchievementDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/game/achievement/{externalGameId}/{externalAchievementId}',
            path: {
                'externalGameId': externalGameId,
                'externalAchievementId': externalAchievementId,
            },
        });
    }
}
