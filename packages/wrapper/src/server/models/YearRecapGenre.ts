/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameGenre } from './GameGenre';
import type { YearRecap } from './YearRecap';
export type YearRecapGenre = {
    id: number;
    genre: GameGenre;
    genreId: number;
    recap: YearRecap;
    recapId: number;
    totalGames: number;
    totalGamesFinished: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

