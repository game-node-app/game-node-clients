/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategorySuggestion } from './AwardsCategorySuggestion';
export type VotableAwardsCategoryDto = {
    isVotable: boolean;
    votingStartDate: string;
    votingEndDate: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    id: number;
    eventId: number;
    name: string;
    order: number;
    description: string;
    /**
     * If this category corresponds to the 'global' goty award.
     */
    isGOTY: boolean;
    /**
     * If this category corresponds to the 'personal goty' award.
     */
    isPersonalGOTY: boolean;
    suggestions: Array<AwardsCategorySuggestion>;
};

