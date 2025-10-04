/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementGrantRequestDto } from '../models/AchievementGrantRequestDto';
import type { Object } from '../models/Object';
import type { ObtainedAchievementDto } from '../models/ObtainedAchievementDto';
import type { PaginatedAchievementsResponseDto } from '../models/PaginatedAchievementsResponseDto';
import type { UpdateFeaturedObtainedAchievementDto } from '../models/UpdateFeaturedObtainedAchievementDto';
import type { UpdateFeaturedObtainedAchievementV2Dto } from '../models/UpdateFeaturedObtainedAchievementV2Dto';
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
     * @param isFeatured
     * @param orderBy
     * @returns ObtainedAchievementDto
     * @throws ApiError
     */
    public static achievementsControllerGetObtainedAchievementV1(
        id: string,
        targetUserId: string,
        isFeatured?: boolean,
        orderBy?: Object,
    ): CancelablePromise<ObtainedAchievementDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/obtained/{id}',
            path: {
                'id': id,
            },
            query: {
                'targetUserId': targetUserId,
                'isFeatured': isFeatured,
                'orderBy': orderBy,
            },
        });
    }
    /**
     * @param targetUserId
     * @param isFeatured
     * @param orderBy
     * @returns ObtainedAchievementDto
     * @throws ApiError
     */
    public static achievementsControllerGetAllObtainedAchievementsV1(
        targetUserId: string,
        isFeatured?: boolean,
        orderBy?: Object,
    ): CancelablePromise<Array<ObtainedAchievementDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/obtained',
            query: {
                'targetUserId': targetUserId,
                'isFeatured': isFeatured,
                'orderBy': orderBy,
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
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2(
        requestBody: UpdateFeaturedObtainedAchievementV2Dto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v2/achievements/obtained/featured',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
