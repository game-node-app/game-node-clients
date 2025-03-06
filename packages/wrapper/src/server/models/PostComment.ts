/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Post } from './Post';
import type { Profile } from './Profile';
export type PostComment = {
    post: Post;
    postId: string;
    parentOf: Array<PostComment> | null;
    childOf: Array<PostComment> | null;
    childOfId: string | null;
    id: string;
    /**
     * HTML content of the user's comment.
     */
    content: string;
    /**
     * Author of this comment
     */
    profile: Profile;
    /**
     * User id of the author of this comment
     */
    profileUserId: string;
    createdAt: string;
    updatedAt: string;
};

