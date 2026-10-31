/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementDefinition } from './AchievementDefinition';
import type { Profile } from './Profile';
export type ObtainedAchievement = {
    id: number;
    /**
     * Id (slug) of the related AchievementDefinition
     */
    achievementId: string;
    definition?: AchievementDefinition;
    tier: number;
    profile: Profile;
    profileUserId: string;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
};

