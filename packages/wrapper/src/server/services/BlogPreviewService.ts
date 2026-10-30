/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogPreviewDto } from '../models/BlogPreviewDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogPreviewService {
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static blogPreviewControllerMediaV1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/preview/media/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param postId
     * @param locale
     * @returns BlogPreviewDto
     * @throws ApiError
     */
    public static blogPreviewControllerPreviewV1(
        postId: string,
        locale: 'en' | 'pt-BR',
    ): CancelablePromise<BlogPreviewDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/preview/{postId}',
            path: {
                'postId': postId,
            },
            query: {
                'locale': locale,
            },
        });
    }
}
