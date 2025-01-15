/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GameRepositoryFilterDto = {
    /**
     * If this is supplied, filtering will be done only for entities specified here. <br>
     * Useful to filter data received from entities which hold game ids (like GameStatistics, Reviews, etc.)
     */
    ids?: Array<number>;
    status?: GameRepositoryFilterDto.status;
    category?: GameRepositoryFilterDto.category;
    themes?: Array<number>;
    gameModes?: Array<number>;
    platforms?: Array<number>;
    genres?: Array<number>;
    offset?: number;
    limit?: number;
};
export namespace GameRepositoryFilterDto {
    export enum status {
        '_0' = 0,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
        '_6' = 6,
        '_7' = 7,
        '_8' = 8,
    }
    export enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4,
        '_5' = 5,
        '_6' = 6,
        '_7' = 7,
        '_8' = 8,
        '_9' = 9,
        '_10' = 10,
        '_11' = 11,
        '_12' = 12,
        '_13' = 13,
        '_14' = 14,
    }
}

