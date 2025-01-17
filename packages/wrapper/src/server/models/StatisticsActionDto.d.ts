export type StatisticsActionDto = {
    sourceId: (string | number);
    targetUserId?: string;
    sourceType: StatisticsActionDto.sourceType;
};
export declare namespace StatisticsActionDto {
    enum sourceType {
        GAME = "game",
        REVIEW = "review",
        ACTIVITY = "activity",
        REVIEW_COMMENT = "review_comment",
        ACTIVITY_COMMENT = "activity_comment"
    }
}
//# sourceMappingURL=StatisticsActionDto.d.ts.map