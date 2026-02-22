/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
import type { ProfileMetricsTypeDistributionItem } from './ProfileMetricsTypeDistributionItem';
import type { YearRecapGenre } from './YearRecapGenre';
import type { YearRecapMode } from './YearRecapMode';
import type { YearRecapPlatform } from './YearRecapPlatform';
import type { YearRecapPlatformCountDto } from './YearRecapPlatformCountDto';
import type { YearRecapPlayedGameDto } from './YearRecapPlayedGameDto';
import type { YearRecapTheme } from './YearRecapTheme';
export type YearRecapDto = {
    playedGames: Array<YearRecapPlayedGameDto>;
    /**
     * Map of platforms and the number of games played on each platform.
     * This is computed from the playedGames list.
     */
    playedGamesByPlatform: Array<YearRecapPlatformCountDto>;
    distributionByGenre: Array<ProfileMetricsTypeDistributionItem>;
    distributionByMode: Array<ProfileMetricsTypeDistributionItem>;
    distributionByTheme: Array<ProfileMetricsTypeDistributionItem>;
    distributionByPlatform: Array<ProfileMetricsTypeDistributionItem>;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
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
    totalLikesPerformed: number;
    genres: Array<YearRecapGenre>;
    themes: Array<YearRecapTheme>;
    modes: Array<YearRecapMode>;
    platforms: Array<YearRecapPlatform>;
};

