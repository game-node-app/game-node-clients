/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateReportRequestDto } from '../models/CreateReportRequestDto';
import type { HandleReportRequestDto } from '../models/HandleReportRequestDto';
import type { PaginatedReportResponseDto } from '../models/PaginatedReportResponseDto';
import type { Report } from '../models/Report';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportService {
    /**
     * @param includeClosed
     * @param offset
     * @param limit
     * @returns PaginatedReportResponseDto
     * @throws ApiError
     */
    public static reportControllerFindAllByLatestV1(
        includeClosed: boolean = false,
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<PaginatedReportResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/report',
            query: {
                'includeClosed': includeClosed,
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static reportControllerCreateV1(
        requestBody: CreateReportRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/report',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns Report
     * @throws ApiError
     */
    public static reportControllerFindOneByIdV1(
        id: number,
    ): CancelablePromise<Report> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/report/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static reportControllerHandleV1(
        id: number,
        requestBody: HandleReportRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/report/{id}/handle',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
