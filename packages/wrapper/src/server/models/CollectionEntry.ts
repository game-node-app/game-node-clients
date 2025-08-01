/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
import type { CollectionEntryToCollection } from './CollectionEntryToCollection';
import type { Game } from './Game';
import type { GamePlatform } from './GamePlatform';
import type { Library } from './Library';
export type CollectionEntry = {
    /**
     * Collections this entry belongs to
     */
    collections: Array<Collection>;
    id: string;
    game: Game;
    gameId: number;
    /**
     * The platforms on which the user owns the game.
     */
    ownedPlatforms: Array<GamePlatform>;
    collectionsMap: Array<CollectionEntryToCollection>;
    isFavorite: boolean;
    status: CollectionEntry.status;
    library: Library;
    libraryUserId: string;
    finishedAt: string | null;
    startedAt: string | null;
    droppedAt: string | null;
    plannedAt: string | null;
    createdAt: string;
    updatedAt: string;
};
export namespace CollectionEntry {
    export enum status {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

