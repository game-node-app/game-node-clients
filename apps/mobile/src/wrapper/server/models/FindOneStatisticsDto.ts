/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindOneStatisticsDto = {
    sourceId: (string | number);
    sourceType: FindOneStatisticsDto.sourceType;
};
export namespace FindOneStatisticsDto {
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
        ACTIVITY = 'activity',
        REVIEW_COMMENT = 'review_comment',
        ACTIVITY_COMMENT = 'activity_comment',
    }
}

