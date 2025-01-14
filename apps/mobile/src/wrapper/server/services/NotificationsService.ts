/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from '../models/Notification';
import type { NotificationViewUpdateDto } from '../models/NotificationViewUpdateDto';
import type { PaginatedNotificationAggregationDto } from '../models/PaginatedNotificationAggregationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * @param offset
     * @param limit
     * @returns PaginatedNotificationAggregationDto
     * @throws ApiError
     */
    public static notificationsControllerFindAllAndAggregateV1(
        offset?: number,
        limit: number = 20,
    ): CancelablePromise<PaginatedNotificationAggregationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications',
            query: {
                'offset': offset,
                'limit': limit,
            },
        });
    }
    /**
     * Finds new notifications that have been created after last checked time. <br>
     * Returns an empty array on first connection.
     * @returns Notification
     * @throws ApiError
     */
    public static notificationsControllerGetNewNotificationsV1(): CancelablePromise<Array<Notification>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/notifications/new',
        });
    }
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static notificationsControllerUpdateViewedStatusV1(
        requestBody: NotificationViewUpdateDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/v1/notifications/view',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
