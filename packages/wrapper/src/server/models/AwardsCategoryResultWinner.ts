/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategoryResult } from './AwardsCategoryResult';
import type { Game } from './Game';
export type AwardsCategoryResultWinner = {
    id: number;
    result: AwardsCategoryResult;
    resultId: number;
    game: Game;
    gameId: number;
    position: number;
    totalVotes: number;
    /**
     * Percentage of votes for this game in relation to the total votes.
     * Only for the target category.
     */
    votesPercentage: number;
};

