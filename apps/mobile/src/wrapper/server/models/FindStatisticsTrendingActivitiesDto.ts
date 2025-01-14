/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindStatisticsTrendingActivitiesDto = {
    /**
     * Usually, this property should not be used unless a specific activity needs to be retrieved, and it's easier to just
     * call the statistics controller.
     */
    activityId?: string;
    userId?: string;
    activityType?: FindStatisticsTrendingActivitiesDto.activityType;
    period: FindStatisticsTrendingActivitiesDto.period;
    offset?: number;
    limit?: number;
};
export namespace FindStatisticsTrendingActivitiesDto {
    export enum activityType {
        REVIEW = 'REVIEW',
        FOLLOW = 'FOLLOW',
        COLLECTION_ENTRY = 'COLLECTION_ENTRY',
    }
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

