/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePostDto } from '../models/CreatePostDto';
import type { GetPostsPaginatedResponseDto } from '../models/GetPostsPaginatedResponseDto';
import type { Post } from '../models/Post';
import type { UploadPostImageRequestDto } from '../models/UploadPostImageRequestDto';
import type { UploadPostImageResponseDto } from '../models/UploadPostImageResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PostsService {
    /**
     * @param postId
     * @param gameId
     * @param profileUserId
     * @param lastCreatedAt
     * @param lastId
     * @param limit
     * @returns GetPostsPaginatedResponseDto
     * @throws ApiError
     */
    public static postsControllerFindAllWithPaginationV1(
        postId?: string,
        gameId?: number,
        profileUserId?: string,
        lastCreatedAt?: string,
        lastId?: string,
        limit: number = 20,
    ): CancelablePromise<GetPostsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/posts/repository',
            query: {
                'postId': postId,
                'gameId': gameId,
                'profileUserId': profileUserId,
                'lastCreatedAt': lastCreatedAt,
                'lastId': lastId,
                'limit': limit,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static postsControllerCreateV1(
        requestBody: CreatePostDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/posts/repository',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param postId
     * @returns Post
     * @throws ApiError
     */
    public static postsControllerFindOneV1(
        postId: string,
    ): CancelablePromise<Post> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/posts/repository/{postId}',
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
    public static postsControllerDeleteV1(
        postId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/posts/repository/{postId}',
            path: {
                'postId': postId,
            },
        });
    }
    /**
     * @param formData
     * @returns UploadPostImageResponseDto
     * @throws ApiError
     */
    public static postsControllerUploadPostImageV1(
        formData: UploadPostImageRequestDto,
    ): CancelablePromise<UploadPostImageResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/posts/repository/image',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
}
