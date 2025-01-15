/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImporterWatchNotification } from '../models/ImporterWatchNotification';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImporterWatchService {
    /**
     * @param id
     * @returns ImporterWatchNotification
     * @throws ApiError
     */
    public static importerWatchControllerFindNotificationV1(
        id: number,
    ): CancelablePromise<ImporterWatchNotification> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/importer/watch/notification/{id}',
            path: {
                'id': id,
            },
        });
    }
}
