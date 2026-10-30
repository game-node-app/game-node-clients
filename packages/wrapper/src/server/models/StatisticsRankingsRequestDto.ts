/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GameRankingCriteriaDto } from './GameRankingCriteriaDto';
export type StatisticsRankingsRequestDto = {
    sourceType: StatisticsRankingsRequestDto.sourceType;
    mode?: StatisticsRankingsRequestDto.mode;
    period?: StatisticsRankingsRequestDto.period;
    from?: string;
    to?: string;
    criteria?: GameRankingCriteriaDto;
    gameId?: number;
    authorId?: string;
    excludeOwn?: boolean;
    reviewId?: string;
    limit?: number;
    offset?: number;
};
export namespace StatisticsRankingsRequestDto {
    export enum sourceType {
        GAME = 'game',
        REVIEW = 'review',
    }
    export enum mode {
        POPULAR = 'popular',
        RECENT = 'recent',
    }
    export enum period {
        DAY = 'day',
        WEEK = 'week',
        MONTH = 'month',
        QUARTER = 'quarter',
        HALF_YEAR = 'half_year',
        YEAR = 'year',
        ALL = 'all',
    }
}

