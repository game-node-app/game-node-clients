/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProfileMetricsTypeDistributionItem = {
    /**
     * Id of the criteria being used.
     * E.g. the id of a 'GameGenre' entity.
     */
    criteriaId: number;
    /**
     * Criteria being used as basis for this distribution.
     * E.g. The name of a 'GameGenre', the name of a Game's category (game, dlc, etc)
     */
    criteriaName: string;
    /**
     * Total number of times this criteria appears.
     * E.g. the number of games of 'adventure' genre a user has.
     */
    count: number;
    /**
     * Total number of items of this criteria that have been 'finished'.
     * E.g. finished 'adventure' genre games.
     */
    finishedCount: number;
};

