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
    /**
     * Total number of times this game has been played.
     * Not available in Steam.
     */
    totalPlayCount: number;
    /**
     * Recent playtime in seconds.
     * 'Recent' definition varies between sources.
     * For Steam, it's the last two weeks,
     * for PSN, it's not available :p
     */
    recentPlaytimeSeconds: number;
    gameId: number;
    profileUserId: string;
};

