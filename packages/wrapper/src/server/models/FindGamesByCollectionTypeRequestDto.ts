/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindGamesByCollectionTypeRequestDto = {
    collectionType: FindGamesByCollectionTypeRequestDto.collectionType;
    relations?: Record<string, any>;
    offset?: number;
    limit?: number;
};
export namespace FindGamesByCollectionTypeRequestDto {
    export enum collectionType {
        UPCOMING = 'upcoming',
        RECENTLY_RELEASED = 'recently_released',
    }
}

