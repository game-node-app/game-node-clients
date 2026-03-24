/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalAchievementsGameGroup } from './JournalAchievementsGameGroup';
export type JournalAchievementsMonthGroup = {
    /**
     * Month of year, 0 indexed (0 = January, 11 = December)
     */
    month: number;
    games: Array<JournalAchievementsGameGroup>;
};

