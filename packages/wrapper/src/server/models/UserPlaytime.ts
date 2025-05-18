/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { Profile } from './Profile';
export type UserPlaytime = {
    lastPlayedDate: string | null;
    firstPlayedDate: string | null;
    id: number;
    source: UserPlaytime.source;
    profile: Profile;
    profileUserId: string;
    game: Game;
    gameId: number;
    /**
     * Total playtime for this game, in seconds.
     */
    totalPlaytimeSeconds: number;
    recentPlaytimeSeconds: number;
    totalPlayCount: number;
    createdAt: string;
    updatedAt: string;
};
export namespace UserPlaytime {
    export enum source {
        STEAM = 'steam',
        PSN = 'psn',
        EPICGAMES = 'epicgames',
        GOG = 'gog',
        BATTLENET = 'battlenet',
        EMULATOR = 'emulator',
        NWII = 'nwii',
        NWIIU = 'nwiiu',
        NSWITCH = 'nswitch',
    }
}

