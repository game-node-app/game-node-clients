/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GuildBoardCandidateGameDto = {
    gameId: number;
    name?: string;
    slug?: string;
    coverUrl?: string | null;
    /**
     * Year the game entered the user's backlog
     */
    sinceYear?: number;
    /**
     * Rounded cached time-to-beat, in hours
     */
    estimatedHours?: number;
};

