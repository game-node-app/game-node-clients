/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyPuzzleResultSummaryDto = {
    status: DailyPuzzleResultSummaryDto.status;
    attempts: number;
};
export namespace DailyPuzzleResultSummaryDto {
    export enum status {
        IN_PROGRESS = 'in_progress',
        WON = 'won',
        LOST = 'lost',
    }
}

