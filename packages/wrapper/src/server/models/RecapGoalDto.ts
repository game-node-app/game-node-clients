/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RecapGoalDto = {
    year: number;
    /**
     * Null when the user has not set a goal for the year.
     */
    target: number | null;
    /**
     * Games finished in the year so far.
     */
    finished: number;
};

