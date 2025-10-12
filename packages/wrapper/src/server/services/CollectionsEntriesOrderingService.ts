/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionEntryUpdateOrderingDto } from '../models/CollectionEntryUpdateOrderingDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CollectionsEntriesOrderingService {
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static collectionsOrderingControllerUpdateCollectionEntryOrderingV1(
        requestBody: CollectionEntryUpdateOrderingDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/collections-entries/ordering',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
