/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProfileMetricsSummaryWindowDto = {
    totalPlaytimeSeconds: number;
    /**
     * Part of `totalPlaytimeSeconds` estimated from games' first observations:
     * Steam's recent total spread over the 14 days before it, or the first
     * total spread over the provider's played dates (PSN, Nintendo) or since
     * the previous sync (Xbox games new to a syncing connection).
     */
    estimatedPlaytimeSeconds: number;
    /**
     * Distinct games with playtime in the window.
     */
    totalGames: number;
};

