/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ReviewCommentDto = {
    parentOf: Array<ReviewCommentDto> | null;
    id: string;
    /**
     * HTML content of the user's comment.
     */
    content: string;
    /**
     * User id of the author of this comment
     */
    profileUserId: string;
    createdAt: string;
    updatedAt: string;
    reviewId: string;
    childOfId: string | null;
};

