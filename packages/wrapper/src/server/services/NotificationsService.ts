/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationReadAllRequestDto } from '../models/NotificationReadAllRequestDto';
import type { NotificationReadAllResponseDto } from '../models/NotificationReadAllResponseDto';
import type { NotificationReadRequestDto } from '../models/NotificationReadRequestDto';
import type { NotificationsResponseDto } from '../models/NotificationsResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * @param cursor Opaque cursor for pagination
     * @param limit Page size limit between 1 and 100 (default 20)
     * @param filter Filter notifications by read state
     * @returns NotificationsResponseDto
     * @throws ApiError
     */
    public static notificationsControllerFindAllV1(
        cursor?: string,
        limit: number = 20,
        filter: 'all' | 'unread' = 'all',
    ): CancelablePromise<NotificationsResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications',
            query: {
                'cursor': cursor,
                'limit': limit,
                'filter': filter,
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
    /**
     * @param requestBody
     * @returns NotificationReadAllResponseDto
     * @throws ApiError
     */
    public static notificationsControllerAcknowledgeReadAllV1(
        requestBody: NotificationReadAllRequestDto,
    ): CancelablePromise<NotificationReadAllResponseDto> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/v1/notifications/read-all',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
