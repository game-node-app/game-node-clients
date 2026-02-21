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
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

