/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Game } from './Game';
import type { Profile } from './Profile';
export type Post = {
    id: string;
    /**
     * The post HTML content
     */
    content: string;
    profile: Profile;
    profileUserId: string;
    game: Game;
    gameId: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

