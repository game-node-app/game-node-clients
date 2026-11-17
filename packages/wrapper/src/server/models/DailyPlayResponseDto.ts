/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyAnswerDto } from './DailyAnswerDto';
import type { DailyCommunityDto } from './DailyCommunityDto';
import type { DailyGuessFeedbackDto } from './DailyGuessFeedbackDto';
import type { DailyHintsDto } from './DailyHintsDto';
import type { DailyRankingSummaryDto } from './DailyRankingSummaryDto';
export type DailyPlayResponseDto = {
    puzzleId: number;
    number: number;
    date: string;
    /**
     * Only once the puzzle is finished.
     */
    community?: DailyCommunityDto;
    /**
     * Signed-in daily finishes only; absent for guests, unfinished plays and weekly puzzles.
     */
    ranking?: DailyRankingSummaryDto;
    mode: DailyPlayResponseDto.mode;
    maxAttempts: number;
    attempts: number;
    status: DailyPlayResponseDto.status;
    feedback: Array<DailyGuessFeedbackDto>;
    hints: DailyHintsDto;
    hintAvailable: boolean;
    /**
     * Guesses made before the specs hint was used; `null` if it wasn't.
     */
    hintAt: number | null;
    /**
     * Only once the puzzle is finished.
     */
    answer?: DailyAnswerDto;
};
export namespace DailyPlayResponseDto {
    export enum mode {
        COVER = 'cover',
        ARTWORK = 'artwork',
        KEYWORDS = 'keywords',
        SPECS = 'specs',
    }
    export enum status {
        IN_PROGRESS = 'in_progress',
        WON = 'won',
        LOST = 'lost',
    }
}

