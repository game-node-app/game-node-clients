/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameExternalGame } from './GameExternalGame';
import type { Library } from './Library';
export type ImporterWatchNotification = {
    id: number;
    library: Library;
    libraryUserId: string;
    source: ImporterWatchNotification.source;
    games: Array<GameExternalGame> | null;
    autoImportedCount: number;
    autoImportSkippedCount: number;
};
export namespace ImporterWatchNotification {
    export enum source {
        STEAM = 'steam',
        PSN = 'psn',
        XBOX = 'xbox',
    }
}

