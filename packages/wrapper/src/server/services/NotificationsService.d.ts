import type { Notification } from '../models/Notification';
import type { NotificationViewUpdateDto } from '../models/NotificationViewUpdateDto';
import type { PaginatedNotificationAggregationDto } from '../models/PaginatedNotificationAggregationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
export declare class NotificationsService {
    /**
     * @param offset
     * @param limit
     * @returns PaginatedNotificationAggregationDto
     * @throws ApiError
     */
    static notificationsControllerFindAllAndAggregateV1(offset?: number, limit?: number): CancelablePromise<PaginatedNotificationAggregationDto>;
    /**
     * Finds new notifications that have been created after last checked time. <br>
     * Returns an empty array on first connection.
     * @returns Notification
     * @throws ApiError
     */
    static notificationsControllerGetNewNotificationsV1(): CancelablePromise<Array<Notification>>;
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    static notificationsControllerUpdateViewedStatusV1(requestBody: NotificationViewUpdateDto): CancelablePromise<any>;
}
//# sourceMappingURL=NotificationsService.d.ts.map