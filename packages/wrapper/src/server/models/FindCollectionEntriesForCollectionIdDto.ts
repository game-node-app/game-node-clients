/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindCollectionEntriesGameFilterDto } from './FindCollectionEntriesGameFilterDto';
import type { FindCollectionEntriesOrderBy } from './FindCollectionEntriesOrderBy';
export type FindCollectionEntriesForCollectionIdDto = {
    orderBy?: FindCollectionEntriesOrderBy;
    status?: FindCollectionEntriesForCollectionIdDto.status;
    gameFilters?: FindCollectionEntriesGameFilterDto;
    offset?: number;
    limit?: number;
};
export namespace FindCollectionEntriesForCollectionIdDto {
    export enum status {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

