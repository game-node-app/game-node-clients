/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsViewRequestDto = {
    sourceType: StatisticsViewRequestDto.sourceType;
    sourceId: (string | number);
    /**
     * Reuse this identity for retries of one navigation impression.
     */
    viewId: string;
};
export namespace StatisticsViewRequestDto {
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

