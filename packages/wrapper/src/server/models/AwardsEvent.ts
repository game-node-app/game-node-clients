/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategory } from './AwardsCategory';
export type AwardsEvent = {
    id: number;
    /**
     * The corresponding year this event should take place in.
     */
    year: number;
    /**
     * Voting start date
     */
    votingStartDate: string;
    votingEndDate: string;
    resultsDate: string;
    /**
     * Optional community nominations phase. When null, the event keeps the legacy vote rules.
     */
    nominationStartDate: string | null;
    nominationEndDate: string | null;
    /**
     * Optional release cutoff. Games released after it are not eligible for the event.
     */
    eligibilityCutoffDate: string | null;
    categories: Array<AwardsCategory>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

