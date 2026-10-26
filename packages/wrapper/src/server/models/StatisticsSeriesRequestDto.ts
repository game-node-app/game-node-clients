/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsSeriesRequestDto = {
    sourceType: StatisticsSeriesRequestDto.sourceType;
    sourceId: (string | number);
    metric: StatisticsSeriesRequestDto.metric;
    from: string;
    to: string;
    granularity: StatisticsSeriesRequestDto.granularity;
};
export namespace StatisticsSeriesRequestDto {
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
        ACTIVITY = 'activity',
        POST = 'post',
        REVIEW_COMMENT = 'review_comment',
        ACTIVITY_COMMENT = 'activity_comment',
        POST_COMMENT = 'post_comment',
    }
    export enum metric {
        VIEWS = 'views',
        LIKES_ADDED = 'likes_added',
        LIKES_REMOVED = 'likes_removed',
        LIKE_CREDIT = 'like_credit',
    }
    export enum granularity {
        HOUR = 'hour',
        DAY = 'day',
    }
}

