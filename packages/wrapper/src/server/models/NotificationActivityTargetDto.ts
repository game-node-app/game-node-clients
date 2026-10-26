/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationActivityContentDto } from './NotificationActivityContentDto';
import type { NotificationGameContextDto } from './NotificationGameContextDto';
export type NotificationActivityTargetDto = {
    type: NotificationActivityTargetDto.type;
    id: string;
    focusId?: string;
    activityType: string;
    content?: NotificationActivityContentDto;
    game?: NotificationGameContextDto;
};
export namespace NotificationActivityTargetDto {
    export enum type {
        ACTIVITY = 'activity',
    }
}

