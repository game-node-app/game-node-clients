/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PostCommentDto = {
    parentOf: Array<PostCommentDto> | null;
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
    postId: string;
    childOfId: string | null;
};

