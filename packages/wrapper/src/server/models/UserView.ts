/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ActivityStatistics } from './ActivityStatistics';
import type { GameStatistics } from './GameStatistics';
import type { Profile } from './Profile';
import type { ReviewStatistics } from './ReviewStatistics';
export type UserView = {
    id: number;
    profile?: Profile;
    profileUserId: string | null;
    createdAt: string;
    updatedAt: string;
    gameStatistics: GameStatistics | null;
    reviewStatistics: ReviewStatistics | null;
    activityStatistics: ActivityStatistics | null;
    commentStatistics: Record<string, any>;
};

