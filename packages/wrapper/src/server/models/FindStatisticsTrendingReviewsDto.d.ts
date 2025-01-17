export type FindStatisticsTrendingReviewsDto = {
    /**
     * Usually, this property should not be used unless a specific review needs to be retrieved, and it's easier to just
     * call the statistics controller.
     */
    reviewId?: string;
    gameId?: number;
    userId?: string;
    period: FindStatisticsTrendingReviewsDto.period;
    offset?: number;
    limit?: number;
};
export declare namespace FindStatisticsTrendingReviewsDto {
    enum period {
        DAY = "day",
        WEEK = "week",
        MONTH = "month",
        QUARTER = "quarter",
        HALF_YEAR = "half_year",
        YEAR = "year",
        ALL = "all"
    }
}
//# sourceMappingURL=FindStatisticsTrendingReviewsDto.d.ts.map