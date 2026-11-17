/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyRankingRowDto } from './DailyRankingRowDto';
import type { PaginationInfo } from './PaginationInfo';
export type DailyRankingResponseDto = {
    /**
     * Points needed to reach position 100 when the viewer is outside it.
     */
    pointsToTop100: number | null;
    period: Record<string, any>;
    /**
     * null in the overall ranking.
     */
    mode: DailyRankingResponseDto.mode | null;
    scope: Record<string, any>;
    /**
     * ISO instant the period ends; null for `all`.
     */
    endsAt: string | null;
    /**
     * Ranked players in the period, filter and scope.
     */
    totalPlayers: number;
    /**
     * The requester's row, or null for guests and players without a counted result.
     */
    viewer: DailyRankingRowDto | null;
    data: Array<DailyRankingRowDto>;
    pagination: PaginationInfo;
};
export namespace DailyRankingResponseDto {
    /**
     * null in the overall ranking.
     */
    export enum mode {
        COVER = 'cover',
        ARTWORK = 'artwork',
        KEYWORDS = 'keywords',
        SPECS = 'specs',
    }
}

