/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ImporterBatchImportRequestDto = {
    externalGameIds?: Array<number>;
    importAll?: boolean;
    status?: ImporterBatchImportRequestDto.status;
    collectionIds?: Array<string>;
};
export namespace ImporterBatchImportRequestDto {
    export enum status {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
        ONGOING = 'ongoing',
    }
}

