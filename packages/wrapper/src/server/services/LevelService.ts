/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserLevel } from '../models/UserLevel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LevelService {
    /**
     * @param userId
     * @returns UserLevel
     * @throws ApiError
     */
    public static levelControllerFindOneV1(
        userId: string,
    ): CancelablePromise<UserLevel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/level/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
}
