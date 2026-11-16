/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProfileMetricsSummaryWindowDto = {
    totalPlaytimeSeconds: number;
    /**
     * Part of `totalPlaytimeSeconds` estimated by spreading Steam's recent
     * total over the 14 days before its first observation.
     */
    estimatedPlaytimeSeconds: number;
    /**
     * Distinct games with playtime in the window.
     */
    totalGames: number;
};

