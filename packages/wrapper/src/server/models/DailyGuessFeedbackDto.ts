/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailySpecsColumnsDto } from './DailySpecsColumnsDto';
export type DailyGuessFeedbackDto = {
    /**
     * `null` for a skip.
     */
    gameId: number | null;
    name: string | null;
    result: DailyGuessFeedbackDto.result;
    commonGenres: Array<string>;
    commonPlatforms: Array<string>;
    /**
     * Specs mode only.
     */
    columns?: DailySpecsColumnsDto;
};
export namespace DailyGuessFeedbackDto {
    export enum result {
        CORRECT = 'correct',
        FRANCHISE = 'franchise',
        WRONG = 'wrong',
        SKIPPED = 'skipped',
    }
}

