/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PlaytimeFilterOrderBy } from './PlaytimeFilterOrderBy';
export type FindAllPlaytimeFiltersDto = {
    period: FindAllPlaytimeFiltersDto.period;
    orderBy?: PlaytimeFilterOrderBy;
    limit?: number;
    offset?: number;
};
export namespace FindAllPlaytimeFiltersDto {
    export enum period {
        WEEK = 'week',
        MONTH = 'month',
        YEAR = 'year',
        ALL = 'all',
    }
}

