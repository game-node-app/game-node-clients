/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementGrantRequestDto } from '../models/AchievementGrantRequestDto';
import type { ObtainedAchievement } from '../models/ObtainedAchievement';
import type { PaginatedAchievementsResponseDto } from '../models/PaginatedAchievementsResponseDto';
import type { UpdateFeaturedObtainedAchievementDto } from '../models/UpdateFeaturedObtainedAchievementDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AchievementsService {
    /**
     * @param offset
     * @param limit
     * @returns PaginatedAchievementsResponseDto
     * @throws ApiError
     */
    public static achievementsControllerGetAchievementsV1(
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<PaginatedAchievementsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements',
            query: {
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param id
     * @param targetUserId
     * @returns ObtainedAchievement
     * @throws ApiError
     */
    public static achievementsControllerGetObtainedAchievementV1(
        id: string,
        targetUserId: string,
    ): CancelablePromise<ObtainedAchievement> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/obtained/{id}',
            path: {
                'id': id,
            },
            query: {
                'targetUserId': targetUserId,
            },
        });
    }
    /**
     * @param targetUserId
     * @returns ObtainedAchievement
     * @throws ApiError
     */
    public static achievementsControllerGetAllObtainedAchievementsV1(
        targetUserId: string,
    ): CancelablePromise<Array<ObtainedAchievement>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/obtained',
            query: {
                'targetUserId': targetUserId,
            },
        });
    }
    /**
     * @param userId
     * @returns any
     * @throws ApiError
     */
    public static achievementsControllerGetFeaturedAchievementForUserIdV1(
        userId: string,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/{userId}/featured',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static achievementsControllerUpdateFeaturedObtainedAchievementV1(
        id: string,
        requestBody: UpdateFeaturedObtainedAchievementDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/achievements/obtained/{id}/featured',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static achievementsControllerGrantAchievementsV1(
        requestBody: AchievementGrantRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/grant',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
