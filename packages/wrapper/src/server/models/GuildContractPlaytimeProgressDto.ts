/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildContractPlaytimeProgressDto = {
    playedSeconds: number;
    estimatedTotalSeconds: number | null;
    /**
     * Clamped to 0..99 while the contract is unfinished
     */
    estimatedPercent: number | null;
};

