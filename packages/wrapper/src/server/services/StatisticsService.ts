/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReactionRequestDto } from '../models/ReactionRequestDto';
import type { ReactionResponseDto } from '../models/ReactionResponseDto';
import type { StatisticsRankingResponseDto } from '../models/StatisticsRankingResponseDto';
import type { StatisticsRankingsRequestDto } from '../models/StatisticsRankingsRequestDto';
import type { StatisticsSeriesDto } from '../models/StatisticsSeriesDto';
import type { StatisticsSeriesRequestDto } from '../models/StatisticsSeriesRequestDto';
import type { StatisticsSourceRequestDto } from '../models/StatisticsSourceRequestDto';
import type { StatisticsStatusDto } from '../models/StatisticsStatusDto';
import type { StatisticsSummaryDto } from '../models/StatisticsSummaryDto';
import type { StatisticsViewRequestDto } from '../models/StatisticsViewRequestDto';
import type { StatisticsViewResponseDto } from '../models/StatisticsViewResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsService {
    /**
     * @param requestBody
     * @returns ReactionResponseDto Applies a like reaction and returns current state and count.
     * @throws ApiError
     */
    public static statisticsControllerAddLikeV1(
        requestBody: ReactionRequestDto,
    ): CancelablePromise<ReactionResponseDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/statistics/like',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns ReactionResponseDto Removes a like reaction and returns current state and count.
     * @throws ApiError
     */
    public static statisticsControllerRemoveLikeV1(
        requestBody: ReactionRequestDto,
    ): CancelablePromise<ReactionResponseDto> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/statistics/like',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns StatisticsSummaryDto
     * @throws ApiError
     */
    public static statisticsControllerFindSummaryV1(
        requestBody: StatisticsSourceRequestDto,
    ): CancelablePromise<StatisticsSummaryDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param sourceType
     * @param sourceId
     * @returns StatisticsStatusDto
     * @throws ApiError
     */
    public static statisticsControllerGetStatusV1(
        sourceType: 'game' | 'review' | 'activity' | 'post' | 'review_comment' | 'activity_comment' | 'post_comment',
        sourceId: (string | number),
    ): CancelablePromise<StatisticsStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/statistics/status',
            query: {
                'sourceType': sourceType,
                'sourceId': sourceId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns StatisticsSeriesDto
     * @throws ApiError
     */
    public static statisticsControllerFindSeriesV1(
        requestBody: StatisticsSeriesRequestDto,
    ): CancelablePromise<StatisticsSeriesDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/series',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns StatisticsRankingResponseDto
     * @throws ApiError
     */
    public static statisticsControllerFindRankingsV1(
        requestBody: StatisticsRankingsRequestDto,
    ): CancelablePromise<StatisticsRankingResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/rankings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns StatisticsViewResponseDto
     * @throws ApiError
     */
    public static statisticsControllerRecordViewV1(
        requestBody: StatisticsViewRequestDto,
    ): CancelablePromise<StatisticsViewResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/view',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
