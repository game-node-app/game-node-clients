/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FindCollectionEntriesOrderBy } from './FindCollectionEntriesOrderBy';
export type FindCollectionEntriesForCollectionIdDto = {
    orderBy?: FindCollectionEntriesOrderBy;
    status?: FindCollectionEntriesForCollectionIdDto.status;
    category?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14>;
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

