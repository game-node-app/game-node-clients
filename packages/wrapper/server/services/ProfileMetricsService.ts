/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileMetricsOverviewDto } from '../models/ProfileMetricsOverviewDto';
import type { ProfileMetricsTypeDistributionResponseDto } from '../models/ProfileMetricsTypeDistributionResponseDto';
import type { ProfileMetricsYearDistributionResponseDto } from '../models/ProfileMetricsYearDistributionResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileMetricsService {
    /**
     * Retrieves basic stats for a user profile
     * @param userId
     * @returns ProfileMetricsOverviewDto
     * @throws ApiError
     */
    public static profileMetricsControllerGetStatsOverviewV1(
        userId: string,
    ): CancelablePromise<ProfileMetricsOverviewDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/metrics/overview/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param by
     * @returns ProfileMetricsYearDistributionResponseDto
     * @throws ApiError
     */
    public static profileMetricsControllerGetYearDistributionV1(
        userId: string,
        by: 'release_year' | 'finish_year' | 'playtime',
    ): CancelablePromise<ProfileMetricsYearDistributionResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/metrics/distribution/year/{userId}',
            path: {
                'userId': userId,
            },
            query: {
                'by': by,
            },
        });
    }
    /**
     * @param userId
     * @param by
     * @returns ProfileMetricsTypeDistributionResponseDto
     * @throws ApiError
     */
    public static profileMetricsControllerGetTypeDistributionV1(
        userId: string,
        by: 'genre' | 'category' | 'mode' | 'theme' | 'platform',
    ): CancelablePromise<ProfileMetricsTypeDistributionResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/profile/metrics/distribution/type/{userId}',
            path: {
                'userId': userId,
            },
            query: {
                'by': by,
            },
        });
    }
}
