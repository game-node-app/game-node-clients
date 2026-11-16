/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsBallotNomineeDto } from './AwardsBallotNomineeDto';
import type { AwardsCategoryTranslationDto } from './AwardsCategoryTranslationDto';
export type AwardsBallotCategoryDto = {
    translations: Array<AwardsCategoryTranslationDto>;
    id: number;
    name: string;
    description: string;
    order: number;
    isPersonalGOTY: boolean;
    /**
     * The game the user voted for in this category, or null.
     */
    voteGameId: number | null;
    /**
     * How many of this category's nominees the user played.
     */
    playedNomineesCount: number;
    nominees: Array<AwardsBallotNomineeDto>;
    /**
     * Only the personal-GOTY category suggests a game; null elsewhere.
     */
    suggestedGameId: number | null;
};

