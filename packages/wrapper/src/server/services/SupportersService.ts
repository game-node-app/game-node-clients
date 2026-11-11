/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginatedSupportersResponseDto } from '../models/PaginatedSupportersResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SupportersService {
    /**
     * Built here instead of PaginationInterceptor: that interceptor falls back
     * to 10 when `limit` is omitted, which would contradict this wall's default.
     * @param offset Items to skip (default 0)
     * @param limit Page size between 1 and 100 (default 20)
     * @returns PaginatedSupportersResponseDto
     * @throws ApiError
     */
    public static supportersControllerGetWallV1(
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<PaginatedSupportersResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/supporters',
            query: {
                'offset': offset,
                'limit': limit,
            },
        });
    }
}
