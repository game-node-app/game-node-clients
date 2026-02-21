/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RecapStatusDto = {
    /**
     * If the recap data for this user is already created.
     * If eligible, this will be true once the recap is created by the corresponding job.
     */
    isRecapCreated: boolean;
    /**
     * If the user is eligible for the target recap year.
     * This is determined by the user's account creation date and the target year.
     */
    isRecapEligible: boolean;
};

