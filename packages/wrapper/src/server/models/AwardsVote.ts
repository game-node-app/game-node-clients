/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AwardsCategory } from './AwardsCategory';
import type { Game } from './Game';
import type { Profile } from './Profile';
export type AwardsVote = {
    id: number;
    category: AwardsCategory;
    categoryId: number;
    game: Game;
    gameId: number;
    profile: Profile;
    profileUserId: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

