/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GameTimeToBeatDto = {
    /**
     * Internal IGDB for this TTB.
     */
    id: number;
    gameId: number;
    /**
     * Average time (in seconds) to finish the game to its credits without spending notable time on extras such as side quests.
     */
    main: number;
    /**
     * Average time (in seconds) to finish the game while mixing in some extras such as side quests without being overly thorough.
     */
    mainPlusSides: number;
    /**
     * Average time (in seconds) to finish the game to 100% completion.
     */
    completionist: number;
    /**
     * Total amount of time to beat submissions for this game (in IGDB)
     */
    submitCount: number;
    createdAt: string;
    updatedAt: string;
};

