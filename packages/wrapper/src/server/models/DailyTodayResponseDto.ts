/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyPuzzleDto } from './DailyPuzzleDto';
export type DailyTodayResponseDto = {
    date: string;
    /**
     * ISO instant of the next puzzle reset (midnight in São Paulo).
     */
    nextResetAt: string;
    puzzles: Array<DailyPuzzleDto>;
};

