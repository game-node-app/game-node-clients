/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityComment } from '../models/ActivityComment';
import type { CreateCommentDto } from '../models/CreateCommentDto';
import type { DeleteCommentDto } from '../models/DeleteCommentDto';
import type { FindAllCommentsDto } from '../models/FindAllCommentsDto';
import type { FindCommentsPaginatedResponseDto } from '../models/FindCommentsPaginatedResponseDto';
import type { Object } from '../models/Object';
import type { ReviewComment } from '../models/ReviewComment';
import type { UpdateCommentDto } from '../models/UpdateCommentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CommentService {
    /**
     * @param requestBody
     * @returns FindCommentsPaginatedResponseDto
     * @throws ApiError
     */
    public static commentControllerFindAllV1(
        requestBody: FindAllCommentsDto,
    ): CancelablePromise<FindCommentsPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/comment',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param sourceType
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static commentControllerFindOneByIdV1(
        sourceType: string,
        id: string,
    ): CancelablePromise<(ReviewComment | ActivityComment)> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/comment/{sourceType}/{id}',
            path: {
                'sourceType': sourceType,
                'id': id,
            },
        });
    }
    /**
     * @param sourceType
     * @param id
     * @param search
     * @param offset
     * @param limit
     * @param orderBy
     * @returns any
     * @throws ApiError
     */
    public static commentControllerFindAllChildrenByIdV1(
        sourceType: string,
        id: string,
        search?: string,
        offset?: number,
        limit: number = 20,
        orderBy?: Object,
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/comment/{sourceType}/{id}/children',
            path: {
                'sourceType': sourceType,
                'id': id,
            },
            query: {
                'search': search,
                'offset': offset,
                'limit': limit,
                'orderBy': orderBy,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static commentControllerCreateV1(
        requestBody: CreateCommentDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/comment/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static commentControllerUpdateV1(
        id: string,
        requestBody: UpdateCommentDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/comment/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static commentControllerDeleteV1(
        id: string,
        requestBody: DeleteCommentDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/comment/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
