/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyPuzzleResultSummaryDto } from './DailyPuzzleResultSummaryDto';
export type DailyPuzzleDto = {
    id: number;
    mode: DailyPuzzleDto.mode;
    number: number;
    date: string;
    maxAttempts: number;
    /**
     * Only for signed-in users who started this puzzle.
     */
    result?: DailyPuzzleResultSummaryDto;
};
export namespace DailyPuzzleDto {
    export enum mode {
        COVER = 'cover',
        ARTWORK = 'artwork',
        KEYWORDS = 'keywords',
        SPECS = 'specs',
    }
}

