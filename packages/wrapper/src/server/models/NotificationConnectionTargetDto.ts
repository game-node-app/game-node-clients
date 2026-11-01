/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationConnectionTargetDto = {
    type: NotificationConnectionTargetDto.type;
    id: string;
    provider: NotificationConnectionTargetDto.provider;
};
export namespace NotificationConnectionTargetDto {
    export enum type {
        CONNECTION = 'connection',
    }
    export enum provider {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
        EPICGAMES = 'epicgames',
    }
}
