import type { GameRepositoryFilterDto } from './GameRepositoryFilterDto';
export type FindStatisticsTrendingGamesDto = {
    criteria?: GameRepositoryFilterDto;
    period: FindStatisticsTrendingGamesDto.period;
    offset?: number;
    limit?: number;
};
export declare namespace FindStatisticsTrendingGamesDto {
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
//# sourceMappingURL=FindStatisticsTrendingGamesDto.d.ts.map