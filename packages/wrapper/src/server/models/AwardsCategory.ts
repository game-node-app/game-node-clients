/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategorySuggestion } from './AwardsCategorySuggestion';
import type { AwardsEvent } from './AwardsEvent';
export type AwardsCategory = {
    id: number;
    event: AwardsEvent;
    eventId: number;
    name: string;
    order: number;
    description: string;
    /**
     * If this category corresponds to the 'global' goty award.
     */
    isGOTY: boolean;
    isPersonalGOTY: boolean;
    /**
     * How many nominees finalization keeps for this category.
     */
    nomineeCount: number;
    /**
     * Set once finalization ran, so a later tick never rewrites admin edits.
     */
    nomineesFinalizedAt: string | null;
    suggestions: Array<AwardsCategorySuggestion>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

