/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationGameContextDto } from './NotificationGameContextDto';
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
    /**
     * Milestone identifier, for awards.milestone and recap.milestone
     */
    milestone?: string;
    /**
     * Game context, for guild.contract-ready
     */
    game?: NotificationGameContextDto;
};
export namespace NotificationTextPreviewDto {
    export enum action {
        ALERT = 'alert',
        SUSPENSION = 'suspension',
        BAN = 'ban',
    }
}

