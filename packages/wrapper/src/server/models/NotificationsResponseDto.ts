/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationInboxItemDto } from './NotificationInboxItemDto';
import type { NotificationsPaginationDto } from './NotificationsPaginationDto';
export type NotificationsResponseDto = {
    data: Array<NotificationInboxItemDto>;
    pagination: NotificationsPaginationDto;
    unreadCount: number;
};

