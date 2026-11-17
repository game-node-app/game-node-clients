/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyArchiveResponseDto } from '../models/DailyArchiveResponseDto';
import type { DailyImportResultsRequestDto } from '../models/DailyImportResultsRequestDto';
import type { DailyImportResultsResponseDto } from '../models/DailyImportResultsResponseDto';
import type { DailyPlayRequestDto } from '../models/DailyPlayRequestDto';
import type { DailyPlayResponseDto } from '../models/DailyPlayResponseDto';
import type { DailyPracticePlayResponseDto } from '../models/DailyPracticePlayResponseDto';
import type { DailyPracticeStartRequestDto } from '../models/DailyPracticeStartRequestDto';
import type { DailyRankingResponseDto } from '../models/DailyRankingResponseDto';
import type { DailyResultsResponseDto } from '../models/DailyResultsResponseDto';
import type { DailyTodayResponseDto } from '../models/DailyTodayResponseDto';
import type { DailyWeeklyRankingResponseDto } from '../models/DailyWeeklyRankingResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DailyService {
    /**
     * @returns DailyTodayResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindTodayV1(): CancelablePromise<DailyTodayResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily',
        });
    }
    /**
     * @param period
     * @param mode
     * @param scope
     * @param offset
     * @param limit
     * @returns DailyRankingResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindRankingV1(
        period: 'today' | 'week' | 'month' | 'all' = 'week',
        mode?: 'cover' | 'artwork' | 'keywords' | 'specs',
        scope: 'all' | 'following' = 'all',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<DailyRankingResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/ranking',
            query: {
                'period': period,
                'mode': mode,
                'scope': scope,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @returns DailyWeeklyRankingResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindWeeklyRankingV1(): CancelablePromise<DailyWeeklyRankingResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/weekly/ranking',
        });
    }
    /**
     * @param mode
     * @param offset
     * @param limit
     * @returns DailyArchiveResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindArchiveV1(
        mode?: 'cover' | 'artwork' | 'keywords' | 'specs',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<DailyArchiveResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/archive',
            query: {
                'mode': mode,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * Evaluates a whole play. Signed-in progress is saved and can only grow; guests are evaluated without saving.
     * @param id
     * @param requestBody
     * @returns DailyPlayResponseDto
     * @throws ApiError
     */
    public static dailyControllerPlayV1(
        id: number,
        requestBody: DailyPlayRequestDto,
    ): CancelablePromise<DailyPlayResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/daily/puzzles/{id}/play',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Starts a practice round; the round id is the capability for guests.
     * @param requestBody
     * @returns DailyPracticePlayResponseDto
     * @throws ApiError
     */
    public static dailyControllerStartPracticeV1(
        requestBody: DailyPracticeStartRequestDto,
    ): CancelablePromise<DailyPracticePlayResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/daily/practice',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Same feedback as the daily mode; progress stored on the round can only grow.
     * @param id
     * @param requestBody
     * @returns DailyPracticePlayResponseDto
     * @throws ApiError
     */
    public static dailyControllerPlayPracticeV1(
        id: string,
        requestBody: DailyPlayRequestDto,
    ): CancelablePromise<DailyPracticePlayResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/daily/practice/{id}/play',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param mode
     * @param kind
     * @returns DailyResultsResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindResultsV1(
        mode?: 'cover' | 'artwork' | 'keywords' | 'specs',
        kind?: 'daily' | 'weekly',
    ): CancelablePromise<DailyResultsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/results',
            query: {
                'mode': mode,
                'kind': kind,
            },
        });
    }
    /**
     * Imports finished guest plays into the signed-in account.
     * @param requestBody
     * @returns DailyImportResultsResponseDto
     * @throws ApiError
     */
    public static dailyControllerImportResultsV1(
        requestBody: DailyImportResultsRequestDto,
    ): CancelablePromise<DailyImportResultsResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/daily/results/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param token
     * @returns binary
     * @throws ApiError
     */
    public static dailyControllerGetImageV1(
        token: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/images/{token}',
            path: {
                'token': token,
            },
        });
    }
}
