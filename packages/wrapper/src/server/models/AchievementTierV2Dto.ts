/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AchievementTierV2Dto = {
    level: number;
    threshold: number;
    expReward: number;
    obtainedCount: number;
    /**
     * Fraction (0-1) of profiles that obtained this tier. May be up to one hour stale.
     */
    rarity: number;
};

