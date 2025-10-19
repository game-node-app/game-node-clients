/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
export type UserConnectionDto = {
    isImporterViable: boolean;
    isImporterWatchViable: boolean;
    isPlaytimeImportViable: boolean;
    id: number;
    type: UserConnectionDto.type;
    profileUserId: string;
    sourceUserId: string;
    sourceUsername: string;
    isImporterEnabled: boolean;
    isPlaytimeImportEnabled: boolean;
    isAutoImportEnabled: boolean;
    autoImportCollection: Collection | null;
    autoImportCollectionId: string | null;
};
export namespace UserConnectionDto {
    export enum type {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
    }
}

