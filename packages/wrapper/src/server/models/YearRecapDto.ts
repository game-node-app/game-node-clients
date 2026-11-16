/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Profile } from './Profile';
import type { ProfileMetricsTypeDistributionItem } from './ProfileMetricsTypeDistributionItem';
import type { RecapCalendarDto } from './RecapCalendarDto';
import type { RecapPlaytimeByPlatformDto } from './RecapPlaytimeByPlatformDto';
import type { RecapTopGameDto } from './RecapTopGameDto';
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
    /**
     * Added minus finished minus dropped games in the year, floored at zero.
     */
    backlogGrowth: number;
    /**
     * Null for Recaps generated before the daily calendar existed.
     */
    calendar: RecapCalendarDto | null;
    topGames: Array<RecapTopGameDto>;
    playtimeByPlatform: Array<RecapPlaytimeByPlatformDto>;
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
    genres: Array<YearRecapGenre>;
    themes: Array<YearRecapTheme>;
    modes: Array<YearRecapMode>;
    platforms: Array<YearRecapPlatform>;
};

