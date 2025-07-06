/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateUpdateCollectionEntryDto = {
    collectionIds: Array<string>;
    gameId: number;
    platformIds: Array<number>;
    isFavorite: boolean;
    finishedAt?: string | null;
    status: CreateUpdateCollectionEntryDto.status;
};
export namespace CreateUpdateCollectionEntryDto {
    export enum status {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

