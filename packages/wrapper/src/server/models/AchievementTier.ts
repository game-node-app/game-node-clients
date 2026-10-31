/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AchievementDefinition } from './AchievementDefinition';
export type AchievementTier = {
    id: number;
    definition: AchievementDefinition;
    definitionId: string;
    /**
     * 1-based position of this tier in its definition.
     */
    level: number;
    threshold: number;
    expReward: number;
    /**
     * Number of profiles that obtained this tier, used for rarity.
     */
    obtainedCount: number;
};

