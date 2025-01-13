/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionEntry } from './CollectionEntry';
import type { Game } from './Game';
import type { Profile } from './Profile';
export type Review = {
    id: string;
    content: string | null;
    rating: number;
    game: Game;
    gameId: number;
    profile: Profile;
    profileUserId: string;
    collectionEntry: CollectionEntry;
    createdAt: string;
    updatedAt: string;
};

