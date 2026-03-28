/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivitiesPaginatedResponseDto } from '../models/ActivitiesPaginatedResponseDto';
import type { Activity } from '../models/Activity';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ActivitiesService {
    /**
     * @param userId
     * @param type
     * @param offset
     * @param limit
     * @returns ActivitiesPaginatedResponseDto
     * @throws ApiError
     */
    public static activitiesRepositoryControllerFindLatestV1(
        userId?: string,
        type?: 'REVIEW' | 'FOLLOW' | 'COLLECTION_ENTRY' | 'POST' | 'OBTAINED_GAME_ACHIEVEMENT',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<ActivitiesPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/activities',
            query: {
                'userId': userId,
                'type': type,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param id
     * @returns Activity
     * @throws ApiError
     */
    public static activitiesRepositoryControllerFindOneByIdV1(
        id: string,
    ): CancelablePromise<Activity> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/activities/detail/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param userId
     * @param type
     * @param offset
     * @param limit
     * @returns ActivitiesPaginatedResponseDto
     * @throws ApiError
     */
    public static activitiesRepositoryV2ControllerFindLatestV2(
        userId?: string,
        type?: 'REVIEW' | 'FOLLOW' | 'COLLECTION_ENTRY' | 'POST' | 'OBTAINED_GAME_ACHIEVEMENT',
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<ActivitiesPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v2/activities',
            query: {
                'userId': userId,
                'type': type,
                'offset': offset,
                'limit': limit,
            },
        });
    }
}
