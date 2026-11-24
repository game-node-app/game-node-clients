/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StatisticsBatchSummaryItemDto } from './StatisticsBatchSummaryItemDto';
export type StatisticsBatchSummaryResponseDto = {
    items: Array<StatisticsBatchSummaryItemDto>;
    asOf: string;
    projectionLagSeconds: number;
    hasFailedEvents: boolean;
    historyComplete: boolean;
    completeSince: string | null;
};

