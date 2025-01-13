/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityStatistics } from './ActivityStatistics';
import type { CommentStatistics } from './CommentStatistics';
import type { GameStatistics } from './GameStatistics';
import type { Profile } from './Profile';
import type { ReviewStatistics } from './ReviewStatistics';
export type UserLike = {
    id: number;
    profile: Profile;
    profileUserId: string;
    createdAt: string;
    updatedAt: string;
    gameStatistics: GameStatistics | null;
    gameStatisticsId: number | null;
    reviewStatistics: ReviewStatistics | null;
    reviewStatisticsId: number | null;
    activityStatistics: ActivityStatistics | null;
    activityStatisticsId: number | null;
    commentStatistics: CommentStatistics | null;
    commentStatisticsId: number | null;
};

