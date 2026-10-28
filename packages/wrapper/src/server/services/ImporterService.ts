/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImporterBatchImportRequestDto } from '../models/ImporterBatchImportRequestDto';
import type { ImporterBatchImportResponseDto } from '../models/ImporterBatchImportResponseDto';
import type { ImporterBatchStatusRequestDto } from '../models/ImporterBatchStatusRequestDto';
import type { ImporterPaginatedResponseDto } from '../models/ImporterPaginatedResponseDto';
import type { ImporterStatusUpdateRequestDto } from '../models/ImporterStatusUpdateRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImporterService {
    /**
     * @param source
     * @param excludeInLibrary
     * @param limit
     * @param offset
     * @param search
     * @returns ImporterPaginatedResponseDto
     * @throws ApiError
     */
    public static importerControllerFindUnprocessedEntriesV1(
        source: string,
        excludeInLibrary: boolean = false,
        limit: number = 20,
        offset?: number,
        search?: string,
    ): CancelablePromise<ImporterPaginatedResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/importer/{source}',
            path: {
                'source': source,
            },
            query: {
                'excludeInLibrary': excludeInLibrary,
                'limit': limit,
                'offset': offset,
                'search': search,
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
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static importerControllerChangeStatusBatchV1(
        requestBody: ImporterBatchStatusRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/importer/status/batch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param source
     * @param requestBody
     * @returns ImporterBatchImportResponseDto
     * @throws ApiError
     */
    public static importerControllerImportBatchV1(
        source: 'steam' | 'psn' | 'xbox',
        requestBody: ImporterBatchImportRequestDto,
    ): CancelablePromise<ImporterBatchImportResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/importer/{source}/import',
            path: {
                'source': source,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
