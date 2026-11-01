/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
export type OwnUserConnectionDto = {
    unprocessedCount?: number;
    lastSyncedAt?: string | null;
    authStatus: OwnUserConnectionDto.authStatus;
    isImporterViable: boolean;
    isImporterWatchViable: boolean;
    isPlaytimeImportViable: boolean;
    isAchievementImportViable: boolean;
    id: number;
    type: OwnUserConnectionDto.type;
    profileUserId: string;
    sourceUserId: string;
    sourceUsername: string;
    isAutoImportEnabled: boolean;
    autoImportCollection: Collection | null;
    autoImportCollectionId: string | null;
};
export namespace OwnUserConnectionDto {
    export enum authStatus {
        CONNECTED = 'connected',
        REAUTH_REQUIRED = 'reauth_required',
    }
    export enum type {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
        EPICGAMES = 'epicgames',
    }
}

