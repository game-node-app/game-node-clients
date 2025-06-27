/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionEntryToCollection } from './CollectionEntryToCollection';
import type { Library } from './Library';
export type Collection = {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    library: Library;
    libraryUserId: string;
    /**
     * The default status for collection entries added to this collection.
     */
    defaultEntryStatus: Collection.defaultEntryStatus | null;
    entriesMap: Array<CollectionEntryToCollection>;
    isFeatured: boolean;
    isFinished: boolean;
    createdAt: string;
    updatedAt: string;
};
export namespace Collection {
    /**
     * The default status for collection entries added to this collection.
     */
    export enum defaultEntryStatus {
        PLAYING = 'playing',
        FINISHED = 'finished',
        PLANNED = 'planned',
        DROPPED = 'dropped',
    }
}

