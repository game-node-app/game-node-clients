/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindAllCommentsDto = {
    sourceId: string;
    sourceType: FindAllCommentsDto.sourceType;
    offset?: number;
    limit?: number;
    orderBy?: Record<string, any>;
};
export namespace FindAllCommentsDto {
    export enum sourceType {
        REVIEW = 'review',
        ACTIVITY = 'activity',
    }
}

