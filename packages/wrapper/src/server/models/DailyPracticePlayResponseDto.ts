/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyAnswerDto } from './DailyAnswerDto';
import type { DailyGuessFeedbackDto } from './DailyGuessFeedbackDto';
import type { DailyHintsDto } from './DailyHintsDto';
export type DailyPracticePlayResponseDto = {
    /**
     * The round id: the capability for a guest round.
     */
    roundId: string;
    mode: DailyPracticePlayResponseDto.mode;
    maxAttempts: number;
    attempts: number;
    status: DailyPracticePlayResponseDto.status;
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
export namespace DailyPracticePlayResponseDto {
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

