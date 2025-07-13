/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalEntryMonthGroupDto } from './JournalEntryMonthGroupDto';
export type JournalEntryYearGroupDto = {
    /**
     * Year of the grouping
     */
    year: number;
    /**
     * Months within the year
     */
    months: Array<JournalEntryMonthGroupDto>;
};

