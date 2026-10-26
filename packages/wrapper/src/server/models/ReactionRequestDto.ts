/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReactionRequestDto = {
    /**
     * The source type to like/unlike
     */
    sourceType: ReactionRequestDto.sourceType;
    /**
     * Source identifier: UUID for content, positive integer for game
     */
    sourceId: Record<string, any>;
};
export namespace ReactionRequestDto {
    /**
     * The source type to like/unlike
     */
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

