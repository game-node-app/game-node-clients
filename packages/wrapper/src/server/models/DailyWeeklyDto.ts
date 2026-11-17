/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyPuzzleResultSummaryDto } from './DailyPuzzleResultSummaryDto';
export type DailyWeeklyDto = {
    id: number;
    number: number;
    mode: DailyWeeklyDto.mode;
    maxAttempts: number;
    /**
     * ISO instant the week ends (next Monday 00:00 in São Paulo).
     */
    endsAt: string;
    /**
     * Only for signed-in users who started this challenge.
     */
    result?: DailyPuzzleResultSummaryDto;
};
export namespace DailyWeeklyDto {
    export enum mode {
        COVER = 'cover',
        ARTWORK = 'artwork',
        KEYWORDS = 'keywords',
        SPECS = 'specs',
    }
}

