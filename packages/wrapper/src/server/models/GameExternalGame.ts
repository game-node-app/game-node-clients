/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { PsnExtraMappings } from './PsnExtraMappings';
export type GameExternalGame = {
    id: number;
    /**
     * Corresponds to the game id on the target source (see GameExternalGameCategory).
     * It's called uid, not uuid.
     */
    uid: string;
    category?: GameExternalGame.category;
    media?: GameExternalGame.media;
    checksum?: string;
    name?: string;
    url?: string;
    year?: number;
    createdAt: string;
    updatedAt: string;
    game: Game;
    gameId: number;
    psnExtraMappings: Array<PsnExtraMappings> | null;
};
export namespace GameExternalGame {
    export enum category {
        '_1' = 1,
        '_5' = 5,
        '_10' = 10,
        '_11' = 11,
        '_13' = 13,
        '_14' = 14,
        '_15' = 15,
        '_20' = 20,
        '_22' = 22,
        '_23' = 23,
        '_26' = 26,
        '_28' = 28,
        '_29' = 29,
        '_30' = 30,
        '_31' = 31,
        '_32' = 32,
        '_36' = 36,
        '_37' = 37,
        '_54' = 54,
        '_55' = 55,
    }
    export enum media {
        '_1' = 1,
        '_2' = 2,
    }
}

