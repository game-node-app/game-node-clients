/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FollowInfoRequestDto } from '../models/FollowInfoRequestDto';
import type { FollowInfoResponseDto } from '../models/FollowInfoResponseDto';
import type { FollowRegisterDto } from '../models/FollowRegisterDto';
import type { FollowRemoveDto } from '../models/FollowRemoveDto';
import type { FollowStatusDto } from '../models/FollowStatusDto';
import type { UserFollow } from '../models/UserFollow';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FollowService {
    /**
     * @param followerUserId
     * @param followedUserId
     * @returns FollowStatusDto
     * @throws ApiError
     */
    public static followControllerGetFollowerStatusV1(
        followerUserId: string,
        followedUserId: string,
    ): CancelablePromise<FollowStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/follow/status',
            query: {
                'followerUserId': followerUserId,
                'followedUserId': followedUserId,
            },
        });
    }
    /**
     * @param id
     * @returns UserFollow
     * @throws ApiError
     */
    public static followControllerGetUserFollowByIdV1(
        id: number,
    ): CancelablePromise<UserFollow> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/follow/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns FollowInfoResponseDto
     * @throws ApiError
     */
    public static followControllerGetFollowInfoV1(
        requestBody: FollowInfoRequestDto,
    ): CancelablePromise<FollowInfoResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/follow/info',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static followControllerRegisterFollowV1(
        requestBody: FollowRegisterDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/follow',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static followControllerRemoveFollowV1(
        requestBody: FollowRemoveDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/v1/follow',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
