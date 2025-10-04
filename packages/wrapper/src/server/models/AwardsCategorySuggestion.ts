/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategory } from './AwardsCategory';
import type { Game } from './Game';
export type AwardsCategorySuggestion = {
    id: number;
    game: Game;
    gameId: number;
    category: AwardsCategory;
    categoryId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

