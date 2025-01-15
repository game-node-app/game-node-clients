/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameRepositoryFilterDto } from './GameRepositoryFilterDto';
export type FindStatisticsTrendingGamesDto = {
    criteria?: GameRepositoryFilterDto;
    period: FindStatisticsTrendingGamesDto.period;
    offset?: number;
    limit?: number;
};
export namespace FindStatisticsTrendingGamesDto {
    export enum period {
        DAY = 'day',
        WEEK = 'week',
        MONTH = 'month',
        QUARTER = 'quarter',
        HALF_YEAR = 'half_year',
        YEAR = 'year',
        ALL = 'all',
    }
}

