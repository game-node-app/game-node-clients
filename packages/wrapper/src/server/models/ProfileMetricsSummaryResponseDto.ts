/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileMetricsSummaryGameDto } from './ProfileMetricsSummaryGameDto';
import type { ProfileMetricsSummaryNamedTotalDto } from './ProfileMetricsSummaryNamedTotalDto';
import type { ProfileMetricsSummaryWindowDto } from './ProfileMetricsSummaryWindowDto';
export type ProfileMetricsSummaryResponseDto = {
    period: Record<string, any>;
    current: ProfileMetricsSummaryWindowDto;
    /**
     * The window of the same length that ends where the current one starts.
     */
    previous: ProfileMetricsSummaryWindowDto;
    /**
     * The five most played games of the current window, most played first.
     */
    topGames: Array<ProfileMetricsSummaryGameDto>;
    /**
     * Genre with the most playtime. A game counts fully toward each of its
     * genres. `null` when nothing was played or the games have no genre.
     */
    topGenre: ProfileMetricsSummaryNamedTotalDto | null;
    topPlatform: ProfileMetricsSummaryNamedTotalDto | null;
    playedInPeriod: number;
    finishedInPeriod: number;
    reviewedInPeriod: number;
};

