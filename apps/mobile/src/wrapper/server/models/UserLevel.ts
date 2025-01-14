/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
export type UserLevel = {
    /**
     * Should be the same as the profile's UserId
     */
    userId: string;
    profile: Profile;
    currentLevel: number;
    /**
     * XP in the current user-level
     */
    currentLevelExp: number;
    /**
     * Threshold XP to hit the next user-level
     */
    levelUpExpCost: number;
    /**
     * The multiplier to apply to all exp gains
     */
    expMultiplier: number;
};

