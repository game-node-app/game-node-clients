/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementDto } from './AchievementDto';
import type { Profile } from './Profile';
export type ObtainedAchievementDto = {
    achievement: AchievementDto;
    id: number;
    /**
     * Achievement id specified in entries for achievements.data.ts
     */
    achievementId: string;
    profile: Profile;
    profileUserId: string;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
};

