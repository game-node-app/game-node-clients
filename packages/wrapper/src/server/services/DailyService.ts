/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyArchiveResponseDto } from '../models/DailyArchiveResponseDto';
import type { DailyImportResultsRequestDto } from '../models/DailyImportResultsRequestDto';
import type { DailyImportResultsResponseDto } from '../models/DailyImportResultsResponseDto';
import type { DailyPlayRequestDto } from '../models/DailyPlayRequestDto';
import type { DailyPlayResponseDto } from '../models/DailyPlayResponseDto';
import type { DailyResultsResponseDto } from '../models/DailyResultsResponseDto';
import type { DailyTodayResponseDto } from '../models/DailyTodayResponseDto';
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
     * @param mode
     * @returns DailyResultsResponseDto
     * @throws ApiError
     */
    public static dailyControllerFindResultsV1(
        mode?: 'cover' | 'artwork' | 'keywords' | 'specs',
    ): CancelablePromise<DailyResultsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/daily/results',
            query: {
                'mode': mode,
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
