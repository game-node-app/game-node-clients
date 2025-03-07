/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ActivityCommentDto = {
    parentOf: Array<ActivityCommentDto> | null;
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
    activityId: string;
    childOfId: string | null;
};

