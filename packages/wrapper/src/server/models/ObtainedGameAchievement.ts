/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameExternalGame } from './GameExternalGame';
import type { Profile } from './Profile';
export type ObtainedGameAchievement = {
    id: number;
    /**
     * The ID of the achievement in the external platform (e.g., Steam achievement ID).
     * Normalized to a string to accommodate various formats across platforms.
     */
    externalAchievementId: string;
    profile: Profile;
    profileUserId: string;
    externalGame: GameExternalGame;
    externalGameId: number;
    obtainedAt: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

