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
    categories: Array<AwardsCategory>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

