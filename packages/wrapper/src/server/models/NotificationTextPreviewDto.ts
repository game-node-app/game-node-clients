/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationTextPreviewDto = {
    text: string;
    action?: NotificationTextPreviewDto.action;
    reason?: string;
    /**
     * Goal target, for goal reminders
     */
    target?: number;
    /**
     * Finished games so far, for goal reminders
     */
    finished?: number;
};
export namespace NotificationTextPreviewDto {
    export enum action {
        ALERT = 'alert',
        SUSPENSION = 'suspension',
        BAN = 'ban',
    }
}

