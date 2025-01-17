export type FindStatisticsTrendingActivitiesDto = {
    /**
     * Usually, this property should not be used unless a specific activity needs to be retrieved, and it's easier to just
     * call the statistics controller.
     */
    activityId?: string;
    userId?: string;
    activityType?: FindStatisticsTrendingActivitiesDto.activityType;
    period: FindStatisticsTrendingActivitiesDto.period;
    offset?: number;
    limit?: number;
};
export declare namespace FindStatisticsTrendingActivitiesDto {
    enum activityType {
        REVIEW = "REVIEW",
        FOLLOW = "FOLLOW",
        COLLECTION_ENTRY = "COLLECTION_ENTRY"
    }
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
//# sourceMappingURL=FindStatisticsTrendingActivitiesDto.d.ts.map