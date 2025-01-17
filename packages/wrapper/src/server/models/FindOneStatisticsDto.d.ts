export type FindOneStatisticsDto = {
    sourceId: (string | number);
    sourceType: FindOneStatisticsDto.sourceType;
};
export declare namespace FindOneStatisticsDto {
    enum sourceType {
        GAME = "game",
        REVIEW = "review",
        ACTIVITY = "activity",
        REVIEW_COMMENT = "review_comment",
        ACTIVITY_COMMENT = "activity_comment"
    }
}
//# sourceMappingURL=FindOneStatisticsDto.d.ts.map