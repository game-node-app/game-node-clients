/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationImportGameDto } from './NotificationImportGameDto';
export type NotificationImportPreviewDto = {
    provider: NotificationImportPreviewDto.provider;
    gameCount: number;
    importedCount: number;
    skippedCount: number;
    failedCount: number;
    gameSample: Array<NotificationImportGameDto>;
};
export namespace NotificationImportPreviewDto {
    export enum provider {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
        EPICGAMES = 'epicgames',
    }
}

