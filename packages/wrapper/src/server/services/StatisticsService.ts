/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindOneStatisticsDto } from '../models/FindOneStatisticsDto';
import type { FindStatisticsTrendingActivitiesDto } from '../models/FindStatisticsTrendingActivitiesDto';
import type { FindStatisticsTrendingGamesDto } from '../models/FindStatisticsTrendingGamesDto';
import type { FindStatisticsTrendingReviewsDto } from '../models/FindStatisticsTrendingReviewsDto';
import type { GameStatisticsPaginatedResponseDto } from '../models/GameStatisticsPaginatedResponseDto';
import type { ReviewStatisticsPaginatedResponseDto } from '../models/ReviewStatisticsPaginatedResponseDto';
import type { StatisticsStatus } from '../models/StatisticsStatus';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static statisticsControllerFindOneBySourceIdAndTypeV1(
        requestBody: FindOneStatisticsDto,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns GameStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    public static statisticsControllerFindTrendingGamesV1(
        requestBody: FindStatisticsTrendingGamesDto,
    ): CancelablePromise<GameStatisticsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/trending/games',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ReviewStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    public static statisticsControllerFindTrendingReviewsV1(
        requestBody: FindStatisticsTrendingReviewsDto,
    ): CancelablePromise<ReviewStatisticsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/trending/reviews',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ReviewStatisticsPaginatedResponseDto
     * @throws ApiError
     */
    public static statisticsControllerFindTrendingActivitiesV1(
        requestBody: FindStatisticsTrendingActivitiesDto,
    ): CancelablePromise<ReviewStatisticsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/trending/activities',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param statisticsId
     * @param sourceType
     * @returns StatisticsStatus
     * @throws ApiError
     */
    public static statisticsControllerGetStatusV1(
        statisticsId: number,
        sourceType: 'game' | 'review' | 'activity' | 'review_comment' | 'activity_comment',
    ): CancelablePromise<StatisticsStatus> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/statistics/status',
            query: {
                'statisticsId': statisticsId,
                'sourceType': sourceType,
            },
        });
    }
}
