/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SyncIgdbService {
    /**
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static igdbSyncControllerRegisterUpdateJobV1(
        requestBody: Array<string>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/sync/igdb',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
