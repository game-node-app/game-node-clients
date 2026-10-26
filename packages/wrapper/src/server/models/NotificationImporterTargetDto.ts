/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type NotificationImporterTargetDto = {
    type: NotificationImporterTargetDto.type;
    id: string;
    provider: NotificationImporterTargetDto.provider;
};
export namespace NotificationImporterTargetDto {
    export enum type {
        IMPORTER = 'importer',
    }
    export enum provider {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
    }
}

