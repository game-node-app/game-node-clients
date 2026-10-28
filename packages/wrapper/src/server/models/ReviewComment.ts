/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
import type { Review } from './Review';
import type { StatisticsTarget } from './StatisticsTarget';
export type ReviewComment = {
    review: Review;
    reviewId: string;
    statisticsTarget: StatisticsTarget | null;
    statisticsTargetId: number | null;
    parentOf: Array<ReviewComment> | null;
    childOf: Array<ReviewComment> | null;
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

