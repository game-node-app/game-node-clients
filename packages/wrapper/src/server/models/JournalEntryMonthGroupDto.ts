/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JournalEntryDayGroupDto } from './JournalEntryDayGroupDto';
export type JournalEntryMonthGroupDto = {
    /**
     * Month of the grouping
     */
    month: number;
    /**
     * Days within the month
     */
    days: Array<JournalEntryDayGroupDto>;
};

