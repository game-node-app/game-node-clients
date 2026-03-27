/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameAchievementWithObtainedInfo } from './GameAchievementWithObtainedInfo';
export type JournalAchievementsGameGroup = {
    gameId: number;
    externalGameId: number;
    source: JournalAchievementsGameGroup.source;
    sourceName: string;
    sourceAbbreviatedName: string;
    sourceIcon: string;
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
export namespace JournalAchievementsGameGroup {
    export enum source {
        '_1' = 1,
        '_3' = 3,
        '_5' = 5,
        '_10' = 10,
        '_11' = 11,
        '_13' = 13,
        '_14' = 14,
        '_15' = 15,
        '_20' = 20,
        '_22' = 22,
        '_23' = 23,
        '_26' = 26,
        '_28' = 28,
        '_29' = 29,
        '_30' = 30,
        '_31' = 31,
        '_32' = 32,
        '_36' = 36,
        '_37' = 37,
        '_54' = 54,
        '_55' = 55,
        '_121' = 121,
    }
}

