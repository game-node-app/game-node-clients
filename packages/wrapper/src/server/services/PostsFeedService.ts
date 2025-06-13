/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetPostsPaginatedResponseDto } from '../models/GetPostsPaginatedResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PostsFeedService {
    /**
     * @param criteria
     * @param lastCreatedAt
     * @param lastId
     * @param limit
     * @param postId
     * @returns GetPostsPaginatedResponseDto
     * @throws ApiError
     */
    public static postsFeedControllerBuildFeedV1(
        criteria: 'following' | 'all',
        lastCreatedAt?: string,
        lastId?: string,
        limit: number = 20,
        postId?: string,
    ): CancelablePromise<GetPostsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/posts/feed',
            query: {
                'criteria': criteria,
                'lastCreatedAt': lastCreatedAt,
                'lastId': lastId,
                'limit': limit,
                'postId': postId,
            },
        });
    }
}
