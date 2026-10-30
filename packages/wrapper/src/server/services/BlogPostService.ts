/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogArticleDto } from '../models/BlogArticleDto';
import type { BlogListResponseDto } from '../models/BlogListResponseDto';
import type { BlogTagDto } from '../models/BlogTagDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogPostService {
    /**
     * @param locale
     * @returns BlogTagDto
     * @throws ApiError
     */
    public static blogPostControllerTagsV1(
        locale: 'en' | 'pt-BR' = 'en',
    ): CancelablePromise<Array<BlogTagDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post/tags',
            query: {
                'locale': locale,
            },
        });
    }
    /**
     * @param postId
     * @param locale
     * @returns BlogArticleDto
     * @throws ApiError
     */
    public static blogPostControllerOneV1(
        postId: string,
        locale: 'en' | 'pt-BR' = 'en',
    ): CancelablePromise<BlogArticleDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post/{postId}',
            path: {
                'postId': postId,
            },
            query: {
                'locale': locale,
            },
        });
    }
    /**
     * @param locale
     * @param tag
     * @param limit
     * @param offset
     * @returns BlogListResponseDto
     * @throws ApiError
     */
    public static blogPostControllerListV1(
        locale: 'en' | 'pt-BR' = 'en',
        tag?: string,
        limit: number = 10,
        offset?: number,
    ): CancelablePromise<BlogListResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post',
            query: {
                'locale': locale,
                'tag': tag,
                'limit': limit,
                'offset': offset,
            },
        });
    }
}
