/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsSummaryDto = {
    asOf: string;
    sourceType: StatisticsSummaryDto.sourceType;
    sourceId: (string | number);
    viewsCount: number;
    likesCount: number;
    projectionLagSeconds: number;
    hasFailedEvents: boolean;
    historyComplete: boolean;
    completeSince: string | null;
};
export namespace StatisticsSummaryDto {
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
        ACTIVITY = 'activity',
        POST = 'post',
        REVIEW_COMMENT = 'review_comment',
        ACTIVITY_COMMENT = 'activity_comment',
        POST_COMMENT = 'post_comment',
    }
}

