/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyRevealDto = {
    column: DailyRevealDto.column;
    /**
     * The answer's values for that column.
     */
    values: Array<string>;
};
export namespace DailyRevealDto {
    export enum column {
        RELEASE_YEAR = 'releaseYear',
        GENRES = 'genres',
        PLATFORMS = 'platforms',
        COMPANIES = 'companies',
        FRANCHISE = 'franchise',
        THEMES = 'themes',
        GAME_MODES = 'gameModes',
        PERSPECTIVES = 'perspectives',
        GAME_ENGINES = 'gameEngines',
    }
}

