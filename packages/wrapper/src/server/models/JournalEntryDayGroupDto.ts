/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalEntryStatusDto } from './JournalEntryStatusDto';
export type JournalEntryDayGroupDto = {
    /**
     * Day of the grouping
     */
    day: number;
    /**
     * List of games and their statuses for the day
     */
    entries: Array<JournalEntryStatusDto>;
};

