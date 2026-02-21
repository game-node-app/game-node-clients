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
    totalReviewsCreated: number;
    totalCollectionsCreated: number;
    totalFollowersGained: number;
    totalLikesReceived: number;
    playedGames: Array<YearRecapPlayedGame>;
    genres: Array<YearRecapGenre>;
    themes: Array<YearRecapTheme>;
    modes: Array<YearRecapMode>;
    platforms: Array<YearRecapPlatform>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

