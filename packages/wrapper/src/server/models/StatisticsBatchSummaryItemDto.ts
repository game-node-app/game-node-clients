/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsBatchSummaryItemDto = {
    sourceType: StatisticsBatchSummaryItemDto.sourceType;
    sourceId: (string | number);
    viewsCount: number;
    likesCount: number;
    /**
     * Total comments including replies; 0 for non-commentable sources.
     */
    commentsCount: number;
    isLiked: boolean;
    isViewed: boolean;
};
export namespace StatisticsBatchSummaryItemDto {
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

