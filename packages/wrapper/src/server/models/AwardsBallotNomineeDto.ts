/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AwardsBallotNomineeDto = {
    gameId: number;
    status: Record<string, any>;
    /**
     * Total playtime recorded for the user and game, in seconds.
     */
    playtimeSeconds: number;
    /**
     * The user's review rating, from 0 to 5, or null.
     */
    rating: number | null;
};

