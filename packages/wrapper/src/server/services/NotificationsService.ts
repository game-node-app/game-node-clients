/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationReadRequestDto } from '../models/NotificationReadRequestDto';
import type { NotificationsResponseDto } from '../models/NotificationsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * @param cursor Opaque cursor for pagination
     * @param limit Page size limit between 1 and 100 (default 20)
     * @returns NotificationsResponseDto
     * @throws ApiError
     */
    public static notificationsControllerFindAllV1(
        cursor?: string,
        limit: number = 20,
    ): CancelablePromise<NotificationsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications',
            query: {
                'cursor': cursor,
                'limit': limit,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static notificationsControllerAcknowledgeReadV1(
        requestBody: NotificationReadRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/notifications/read',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
