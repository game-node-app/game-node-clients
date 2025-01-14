/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
export type GamePlaytime = {
    id: number;
    gameId: number;
    game: Game;
    sourceId: number;
    timeMain: number | null;
    timePlus: number | null;
    time100: number | null;
    timeAll: number | null;
    createdAt: string;
    updatedAt: string;
};

