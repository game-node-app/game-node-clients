/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsSeriesBucketDto } from './StatisticsSeriesBucketDto';
export type StatisticsSeriesDto = {
    asOf: string;
    sourceType: StatisticsSeriesDto.sourceType;
    sourceId: (string | number);
    metric: StatisticsSeriesDto.metric;
    from: string;
    to: string;
    granularity: StatisticsSeriesDto.granularity;
    buckets: Array<StatisticsSeriesBucketDto>;
    projectionLagSeconds: number;
    hasFailedEvents: boolean;
    historyComplete: boolean;
    completeSince: string | null;
};
export namespace StatisticsSeriesDto {
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

