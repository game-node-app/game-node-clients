/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameExternalGame } from './GameExternalGame';
export type UserPlaytimeDto = {
    lastPlayedDate: string | null;
    firstPlayedDate: string | null;
    id: number;
    source: UserPlaytimeDto.source;
    profileUserId: string;
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
    /**
     * Recent playtime in seconds.
     * 'Recent' definition varies between sources.
     * For Steam, it's the last two weeks,
     * for PSN, it's not available :p
     */
    recentPlaytimeSeconds: number;
    /**
     * Total number of times this game has been played.
     * Not available in Steam.
     */
    totalPlayCount: number;
    createdAt: string;
    updatedAt: string;
};
export namespace UserPlaytimeDto {
    export enum source {
        STEAM = 'steam',
        PSN = 'psn',
    }
}

