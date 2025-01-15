/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCommentDto = {
    /**
     * UUID of the target entity. Comments can only be attributed to
     * UUID based entities.
     */
    sourceId: string;
    sourceType: CreateCommentDto.sourceType;
    content: string;
    childOf?: string;
};
export namespace CreateCommentDto {
    export enum sourceType {
        REVIEW = 'review',
        ACTIVITY = 'activity',
    }
}

