/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindStatisticsTrendingReviewsDto = {
    /**
     * Usually, this property should not be used unless a specific review needs to be retrieved, and it's easier to just
     * call the statistics controller.
     */
    reviewId?: string;
    gameId?: number;
    userId?: string;
    period: FindStatisticsTrendingReviewsDto.period;
    offset?: number;
    limit?: number;
};
export namespace FindStatisticsTrendingReviewsDto {
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

