/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogPost } from '../models/BlogPost';
import type { BlogPostTag } from '../models/BlogPostTag';
import type { CreateBlogPostDto } from '../models/CreateBlogPostDto';
import type { FindAllBlogPostResponseDto } from '../models/FindAllBlogPostResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogPostService {
    /**
     * @returns BlogPostTag
     * @throws ApiError
     */
    public static blogPostControllerFindAllTagsV1(): CancelablePromise<Array<BlogPostTag>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post/tags',
        });
    }
    /**
     * @param postId
     * @returns BlogPost
     * @throws ApiError
     */
    public static blogPostControllerFindOneByIdV1(
        postId: string,
    ): CancelablePromise<BlogPost> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post/{postId}',
            path: {
                'postId': postId,
            },
        });
    }
    /**
     * @param postId
     * @returns void
     * @throws ApiError
     */
    public static blogPostControllerDeleteV1(
        postId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/blog/post/{postId}',
            path: {
                'postId': postId,
            },
        });
    }
    /**
     * @param tag
     * @param includeDraft
     * @param limit
     * @param offset
     * @returns FindAllBlogPostResponseDto
     * @throws ApiError
     */
    public static blogPostControllerFindAllV1(
        tag?: string,
        includeDraft: boolean = false,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<FindAllBlogPostResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/post',
            query: {
                'tag': tag,
                'includeDraft': includeDraft,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param formData
     * @returns any
     * @throws ApiError
     */
    public static blogPostControllerCreateV1(
        formData: CreateBlogPostDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/blog/post',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
