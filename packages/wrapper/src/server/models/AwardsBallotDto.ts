/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsBallotCategoryDto } from './AwardsBallotCategoryDto';
export type AwardsBallotDto = {
    eventId: number;
    year: number;
    phase: Record<string, any>;
    categoriesVoted: number;
    categoriesTotal: number;
    categories: Array<AwardsBallotCategoryDto>;
};

