/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationTextPreviewDto = {
    text: string;
    action?: NotificationTextPreviewDto.action;
    reason?: string;
};
export namespace NotificationTextPreviewDto {
    export enum action {
        ALERT = 'alert',
        SUSPENSION = 'suspension',
        BAN = 'ban',
    }
}

