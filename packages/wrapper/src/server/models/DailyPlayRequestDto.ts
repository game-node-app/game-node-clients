/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyPlayRequestDto = {
    /**
     * Guessed game ids in order, `null` for a skip.
     */
    guesses: Array<number | null>;
    /**
     * Specs mode only: how many guesses existed when the hint (one revealed column, costing an attempt) was used.
     */
    hintAt?: number | null;
};

