/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameExternalGame } from './GameExternalGame';
import type { ObtainedGameAchievement } from './ObtainedGameAchievement';
import type { Profile } from './Profile';
export type ObtainedGameAchievementActivity = {
    id: number;
    profile: Profile;
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
    /**
     * Game achievements obtained by the user for this activity.
     * This reads as 'achievements obtained since last check' and usually only includes
     * one or more achievements for related to a single game, since processing is done on a per-game basis.
     */
    obtainedGameAchievements: Array<ObtainedGameAchievement>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

