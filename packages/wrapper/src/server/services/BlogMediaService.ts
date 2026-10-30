/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlogMediaService {
    /**
     * @param name
     * @returns any
     * @throws ApiError
     */
    public static blogMediaControllerMediaV1(
        name: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/blog/media/{name}',
            path: {
                'name': name,
            },
        });
    }
}
