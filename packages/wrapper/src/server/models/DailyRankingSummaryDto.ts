/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DailyRankingSummaryDto = {
    weekPosition: number | null;
    previousWeekPosition: number | null;
    pointsToTop100: number | null;
    /**
     * Whether this result counts for the ranking.
     */
    counted: boolean;
    /**
     * Points this result earned, with one decimal place.
     */
    pointsEarned: number;
    /**
     * Completion bonus earned by this result, with one decimal place.
     */
    bonusEarned: number;
    /**
     * The viewer's week points including this result.
     */
    weekPoints: number;
};

