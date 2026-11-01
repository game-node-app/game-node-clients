/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ImporterBatchStatusRequestDto = {
    source: ImporterBatchStatusRequestDto.source;
    externalGameIds: Array<number>;
    status: ImporterBatchStatusRequestDto.status;
};
export namespace ImporterBatchStatusRequestDto {
    export enum source {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
        EPICGAMES = 'epicgames',
    }
    export enum status {
        PROCESSED = 'processed',
        IGNORED = 'ignored',
    }
}

