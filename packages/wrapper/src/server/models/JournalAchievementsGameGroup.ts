/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAchievementWithObtainedInfo } from './GameAchievementWithObtainedInfo';
export type JournalAchievementsGameGroup = {
    gameId: number;
    /**
     * If all achievements for this game are obtained, this will be true.
     */
    isComplete: boolean;
    /**
     * Exclusive to PSN.
     * If the platinum trophy for this game is obtained, this will be true.
     * Not all games have a platinum trophy, and if a Platinum is obtained before a new achievement is added to the game,
     * there may be cases where the game is 'platinum' but not 'completed'.
     */
    isPlatinum: boolean;
    achievements: Array<GameAchievementWithObtainedInfo>;
};

