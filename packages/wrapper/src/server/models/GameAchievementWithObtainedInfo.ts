/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PsnAchievementDetails } from './PsnAchievementDetails';
import type { SteamAchievementDetails } from './SteamAchievementDetails';
import type { XboxAchievementDetails } from './XboxAchievementDetails';
export type GameAchievementWithObtainedInfo = {
    name: string;
    description: string | null;
    externalId: string;
    source: GameAchievementWithObtainedInfo.source;
    externalGameId: number;
    gameId: number;
    iconUrl: string;
    /**
     * Related GamePlatform references.
     * Usually, an achievement is only related to one platform.
     */
    platformIds: Array<number>;
    steamDetails?: SteamAchievementDetails | null;
    psnDetails?: PsnAchievementDetails | null;
    xboxDetails?: XboxAchievementDetails | null;
    isObtained: boolean;
    obtainedAt: string | null;
};
export namespace GameAchievementWithObtainedInfo {
    export enum source {
        '_1' = 1,
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
    }
}

