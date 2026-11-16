/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
import type { YearRecapGenre } from './YearRecapGenre';
import type { YearRecapMode } from './YearRecapMode';
import type { YearRecapPlatform } from './YearRecapPlatform';
import type { YearRecapPlayedGame } from './YearRecapPlayedGame';
import type { YearRecapTheme } from './YearRecapTheme';
export type YearRecap = {
    id: number;
    year: number;
    profile: Profile;
    profileUserId: string;
    totalPlayedGames: number;
    totalPlaytimeSeconds: number;
    totalAddedGames: number;
    totalFinishedGames: number;
    totalDroppedGames: number;
    /**
     * Final Recaps are never regenerated.
     */
    isFinal: boolean;
    /**
     * Playtime seconds per UTC day of the year. Null for Recaps generated before the calendar existed.
     */
    dailyPlaytimeSeconds: Array<number> | null;
    /**
     * Community comparison stored at generation time (design 13).
     */
    communityHighlights: Record<string, any> | null;
    totalReviewsCreated: number;
    totalCollectionsCreated: number;
    totalFollowersGained: number;
    totalLikesPerformed: number;
    likesHistoryComplete: boolean;
    likesCompleteSince: string | null;
    playedGames: Array<YearRecapPlayedGame>;
    genres: Array<YearRecapGenre>;
    themes: Array<YearRecapTheme>;
    modes: Array<YearRecapMode>;
    platforms: Array<YearRecapPlatform>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

