/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsRankingItemDto } from './StatisticsRankingItemDto';
import type { StatisticsRankingPaginationDto } from './StatisticsRankingPaginationDto';
export type StatisticsRankingResponseDto = {
    items: Array<StatisticsRankingItemDto>;
    pagination: StatisticsRankingPaginationDto;
    mode: StatisticsRankingResponseDto.mode;
    definitionVersion: string;
    asOf: string;
    effectiveFrom: string | null;
    effectiveTo: string;
    projectionLagSeconds: number;
    hasFailedEvents: boolean;
    historyComplete: boolean;
    completeSince: string | null;
};
export namespace StatisticsRankingResponseDto {
    export enum mode {
        POPULAR = 'popular',
        RECENT = 'recent',
    }
}

