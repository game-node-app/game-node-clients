/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyPuzzleDto } from './DailyPuzzleDto';
import type { DailyWeeklyDto } from './DailyWeeklyDto';
export type DailyTodayResponseDto = {
    date: string;
    /**
     * ISO instant of the next puzzle reset (midnight in São Paulo).
     */
    nextResetAt: string;
    /**
     * This week's challenge, or null when none exists.
     */
    weekly: DailyWeeklyDto | null;
    puzzles: Array<DailyPuzzleDto>;
};

