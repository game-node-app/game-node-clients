/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserCumulativePlaytimeDto = {
    lastPlayedDate: string | null;
    firstPlayedDate: string | null;
    /**
     * Total playtime for this game, in seconds.
     */
    totalPlaytimeSeconds: number;
    totalPlayCount: number;
    recentPlaytimeSeconds: number;
    gameId: number;
    profileUserId: string;
};

