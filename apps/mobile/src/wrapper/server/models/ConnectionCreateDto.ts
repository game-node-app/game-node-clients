/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ConnectionCreateDto = {
    type: ConnectionCreateDto.type;
    /**
     * A string representing a username, user id or profile URL for the target connection <br>
     * e.g. a Steam's profile URL
     */
    userIdentifier: string;
    isImporterEnabled: boolean;
};
export namespace ConnectionCreateDto {
    export enum type {
        STEAM = 'steam',
        PSN = 'psn',
    }
}

