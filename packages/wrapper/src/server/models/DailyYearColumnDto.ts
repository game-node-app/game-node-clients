/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyYearColumnDto = {
    /**
     * Whether the answer was released after ("higher") or before ("lower") the guess.
     */
    direction: DailyYearColumnDto.direction | null;
    match: DailyYearColumnDto.match;
    value: number | null;
};
export namespace DailyYearColumnDto {
    /**
     * Whether the answer was released after ("higher") or before ("lower") the guess.
     */
    export enum direction {
        HIGHER = 'higher',
        LOWER = 'lower',
    }
    export enum match {
        MATCH = 'match',
        PARTIAL = 'partial',
        NONE = 'none',
    }
}

