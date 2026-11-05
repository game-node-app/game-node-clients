/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyResultDto = {
    puzzleId: number;
    mode: DailyResultDto.mode;
    number: number;
    date: string;
    status: DailyResultDto.status;
    attempts: number;
    finishedAt: string | null;
};
export namespace DailyResultDto {
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

