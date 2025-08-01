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
    status?: Array<0 | 2 | 3 | 4 | 5 | 6 | 7 | 8>;
    category?: Array<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14>;
    themes?: Array<number>;
    gameModes?: Array<number>;
    platforms?: Array<number>;
    genres?: Array<number>;
    offset?: number;
    limit?: number;
};

