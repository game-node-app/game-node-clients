/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAchievementWithObtainedInfo } from './GameAchievementWithObtainedInfo';
import type { GameExternalGame } from './GameExternalGame';
export type GameObtainedAchievementActivityDto = {
    obtainedGameAchievements: Array<GameAchievementWithObtainedInfo>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    id: number;
    profileUserId: string;
    totalObtained: number;
    /**
     * If the user has obtained all achievements for the game
     * (including obtained achievements not related to this specific activity), this is set to true.
     * This value may be outdated if a game update/DLC adds new achievements, but
     * for activity purposes it is sufficient.
     */
    hasCompletedAllAchievements: boolean;
    /**
     * Exclusive to PlayStation games: if the user has obtained the platinum trophy for the game
     * This will only be true if the platinum trophy is featured in the list of obtained achievements
     * for this specific activity.
     */
    hasObtainedPlatinumTrophy: boolean;
    /**
     * The related external game the achievements were obtained for.
     * All obtained achievements for this activity should be related to this specific external game, but this is not enforced on the database level.
     */
    externalGame: GameExternalGame;
    externalGameId: number;
};

