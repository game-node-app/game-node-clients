/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameTheme } from './GameTheme';
import type { YearRecap } from './YearRecap';
export type YearRecapTheme = {
    id: number;
    theme: GameTheme;
    themeId: number;
    recap: YearRecap;
    recapId: number;
    totalGames: number;
    totalGamesFinished: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

