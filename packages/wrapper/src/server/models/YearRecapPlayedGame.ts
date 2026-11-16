/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { GamePlatform } from './GamePlatform';
import type { YearRecap } from './YearRecap';
export type YearRecapPlayedGame = {
    id: number;
    recap: YearRecap;
    recapId: number;
    game: Game;
    gameId: number;
    platform: GamePlatform;
    platformId: number;
    /**
     * Total playtime registered for the game during the recap period, in seconds
     */
    totalPlaytimeSeconds: number;
    percentOfTotalPlaytime: number;
    percentOfTotalPlaytimeFormatted: string;
    /**
     * First day the game was played in the year; falls back to the library start date.
     */
    firstPlayedAt: string | null;
    /**
     * Day the game was finished in the year, if any.
     */
    finishedAt: string | null;
    /**
     * The user's review rating (0-5), if any.
     */
    rating: number | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

