/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityComment } from './ActivityComment';
import type { ReviewComment } from './ReviewComment';
import type { UserLike } from './UserLike';
import type { UserView } from './UserView';
export type CommentStatistics = {
    views: Array<UserView>;
    likes: Array<UserLike>;
    reviewComment: ReviewComment | null;
    reviewCommentId: string | null;
    activityComment: ActivityComment | null;
    activityCommentId: string | null;
    id: number;
    viewsCount: number;
    likesCount: number;
};

