/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { GameExternalGame } from './GameExternalGame';
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
     * Since a user can have a single game in more than one source, this helps us identify
     * where it has been imported from.
     */
    externalGame: GameExternalGame;
    externalGameId: number;
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
    }
}

