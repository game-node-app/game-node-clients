/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RecapCalendarStreakDto } from './RecapCalendarStreakDto';
import type { RecapCalendarTopMonthDto } from './RecapCalendarTopMonthDto';
import type { RecapCalendarTopWeekdayDto } from './RecapCalendarTopWeekdayDto';
export type RecapCalendarDto = {
    /**
     * Total playtime seconds for each month, January first.
     */
    monthlyPlaytimeSeconds: Array<number>;
    topMonth: RecapCalendarTopMonthDto | null;
    longestStreak: RecapCalendarStreakDto | null;
    topWeekday: RecapCalendarTopWeekdayDto | null;
    weekendShare: number;
};

