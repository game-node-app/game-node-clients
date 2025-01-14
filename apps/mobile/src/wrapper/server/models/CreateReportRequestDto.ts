/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateReportRequestDto = {
    sourceType: CreateReportRequestDto.sourceType;
    sourceId: string;
    category: CreateReportRequestDto.category;
    reason?: string;
};
export namespace CreateReportRequestDto {
    export enum sourceType {
        REVIEW = 'review',
        PROFILE = 'profile',
        REVIEW_COMMENT = 'review_comment',
        ACTIVITY_COMMENT = 'activity_comment',
    }
    export enum category {
        SPAM = 'spam',
        PERSONAL = 'personal',
        NUDITY = 'nudity',
    }
}

