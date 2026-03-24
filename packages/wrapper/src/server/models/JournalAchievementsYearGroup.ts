/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalAchievementsMonthGroup } from './JournalAchievementsMonthGroup';
export type JournalAchievementsYearGroup = {
    /**
     * Year of achievement obtainment, e.g. 2025
     */
    year: number;
    totalObtained: number;
    months: Array<JournalAchievementsMonthGroup>;
};

