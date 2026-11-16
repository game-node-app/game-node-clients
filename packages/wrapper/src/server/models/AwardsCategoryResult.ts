/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategory } from './AwardsCategory';
import type { AwardsCategoryResultWinner } from './AwardsCategoryResultWinner';
export type AwardsCategoryResult = {
    id: number;
    totalVotesCount: number;
    totalUniqueGamesSubmitted: number;
    totalUsersParticipating: number;
    /**
     * Votes cast by users who had played the game they voted for.
     */
    totalPlayedVotesCount: number;
    categoryId: number;
    category: AwardsCategory;
    winners: Array<AwardsCategoryResultWinner>;
};

