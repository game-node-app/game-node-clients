/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalEntryDetailsDto } from './JournalEntryDetailsDto';
export type JournalEntryDayGroupDto = {
    /**
     * Day of the grouping
     */
    day: number;
    /**
     * List of games and their statuses for the day
     */
    entries: Array<JournalEntryDetailsDto>;
};

