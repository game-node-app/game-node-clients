/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StatisticsActionDto = {
    sourceId: (string | number);
    targetUserId?: string;
    sourceType: StatisticsActionDto.sourceType;
};
export namespace StatisticsActionDto {
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

