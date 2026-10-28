/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameExternalGame } from './GameExternalGame';
import type { Profile } from './Profile';
export type GameCompletionStatus = {
    externalGameId: number;
    profileUserId: string;
    externalGame: GameExternalGame;
    profile: Profile;
    isCompleted: boolean;
    /**
     * Exclusive to PlayStation games.
     * Indicates whether the platinum trophy has been obtained for the game.
     * This is often a key indicator of 100% completion in many games.
     */
    isPlatinumObtained: boolean;
    totalAvailableAchievements: number;
    totalObtainedAchievements: number;
    completedAt: string | null;
    checksum: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

