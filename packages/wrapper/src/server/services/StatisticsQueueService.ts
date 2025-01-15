/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsActionDto } from '../models/StatisticsActionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatisticsQueueService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static statisticsQueueControllerAddLikeV1(
        requestBody: StatisticsActionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/queue/like',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static statisticsQueueControllerRemoveLikeV1(
        requestBody: StatisticsActionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/statistics/queue/like',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static statisticsQueueControllerAddViewV1(
        requestBody: StatisticsActionDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/statistics/queue/view',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
