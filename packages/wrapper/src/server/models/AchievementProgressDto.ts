/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementObtainedTierDto } from './AchievementObtainedTierDto';
export type AchievementProgressDto = {
    achievementId: string;
    value: number;
    /**
     * Highest obtained tier level, 0 when none
     */
    tier: number;
    /**
     * Threshold of the next tier, null when every tier is obtained
     */
    nextThreshold: number | null;
    /**
     * Obtained tiers of the user, ordered by level. Empty when tier is 0.
     */
    obtainedTiers: Array<AchievementObtainedTierDto>;
};

