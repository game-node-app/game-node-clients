/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AcceptGuildContractDto = {
    /**
     * Board entry of the current week being accepted
     */
    boardEntryId?: string;
    /**
     * Active published curated event being accepted
     */
    eventId?: string;
    /**
     * Library game bound to the contract; required when the quest requires a target
     */
    targetGameId?: number;
};

