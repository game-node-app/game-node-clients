/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Notification } from './Notification';
export type NotificationAggregateDto = {
    sourceId: (string | number);
    category: NotificationAggregateDto.category;
    sourceType: NotificationAggregateDto.sourceType;
    notifications: Array<Notification>;
};
export namespace NotificationAggregateDto {
    export enum category {
        FOLLOW = 'follow',
        LIKE = 'like',
        COMMENT = 'comment',
        WATCH = 'watch',
        ALERT = 'alert',
        MENTION = 'mention',
    }
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
        REVIEW_COMMENT = 'review_comment',
        ACTIVITY = 'activity',
        ACTIVITY_COMMENT = 'activity_comment',
        PROFILE = 'profile',
        IMPORTER = 'importer',
        REPORT = 'report',
    }
}

