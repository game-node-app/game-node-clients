/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from './Collection';
import type { Game } from './Game';
import type { GamePlatform } from './GamePlatform';
import type { Review } from './Review';
export type CollectionEntry = {
    id: string;
    collections: Array<Collection>;
    game: Game;
    gameId: number;
    /**
     * The platforms on which the user owns the game.
     */
    ownedPlatforms: Array<GamePlatform>;
    review: Review | null;
    isFavorite: boolean;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

