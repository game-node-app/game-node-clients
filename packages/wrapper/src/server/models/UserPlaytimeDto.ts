/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserPlaytimeDto = {
    lastPlayedDate: string | null;
    firstPlayedDate: string | null;
    id: number;
    source: UserPlaytimeDto.source;
    profileUserId: string;
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
export namespace UserPlaytimeDto {
    export enum source {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
        EPICGAMES = 'epicgames',
        GOG = 'gog',
        BATTLENET = 'battlenet',
        EMULATOR = 'emulator',
        NWII = 'nwii',
        NWIIU = 'nwiiu',
        NSWITCH = 'nswitch',
    }
}

