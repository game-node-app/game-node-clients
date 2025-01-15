/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImporterPaginatedResponseDto } from '../models/ImporterPaginatedResponseDto';
import type { ImporterStatusUpdateRequestDto } from '../models/ImporterStatusUpdateRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImporterService {
    /**
     * @param source
     * @param limit
     * @param offset
     * @returns ImporterPaginatedResponseDto
     * @throws ApiError
     */
    public static importerControllerFindUnprocessedEntriesV1(
        source: string,
        limit: number = 20,
        offset?: number,
    ): CancelablePromise<ImporterPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/importer/{source}',
            path: {
                'source': source,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static importerControllerChangeStatusV1(
        requestBody: ImporterStatusUpdateRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/importer/status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
