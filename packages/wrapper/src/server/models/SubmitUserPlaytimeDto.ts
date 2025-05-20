/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SubmitUserPlaytimeDto = {
    lastPlayedDate: string | null;
    source: SubmitUserPlaytimeDto.source;
    gameId: number;
    /**
     * Total playtime for this game, in seconds.
     */
    totalPlaytimeSeconds: number;
};
export namespace SubmitUserPlaytimeDto {
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

