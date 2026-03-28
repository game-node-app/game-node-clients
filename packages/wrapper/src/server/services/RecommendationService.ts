/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RecommendationService {
    /**
     * @param criteria Criteria to be used for deciding on what to recommend.
     * E.g. finished games, genre of played games, etc.
     * @param limit
     * @returns any
     * @throws ApiError
     */
    public static recommendationControllerGetRecommendationsV1(
        criteria: 'played' | 'finished' | 'genre' | 'theme',
        limit: number = 20,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/recommendation',
            query: {
                'criteria': criteria,
                'limit': limit,
            },
        });
    }
}
