/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserConnectionDto = {
    isImporterViable: boolean;
    isImporterWatchViable: boolean;
    id: number;
    type: UserConnectionDto.type;
    profileUserId: string;
    sourceUserId: string;
    sourceUsername: string;
    isImporterEnabled: boolean;
};
export namespace UserConnectionDto {
    export enum type {
        STEAM = 'steam',
        PSN = 'psn',
    }
}

