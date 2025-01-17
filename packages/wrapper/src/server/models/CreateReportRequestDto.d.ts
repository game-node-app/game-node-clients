export type CreateReportRequestDto = {
    sourceType: CreateReportRequestDto.sourceType;
    sourceId: string;
    category: CreateReportRequestDto.category;
    reason?: string;
};
export declare namespace CreateReportRequestDto {
    enum sourceType {
        REVIEW = "review",
        PROFILE = "profile",
        REVIEW_COMMENT = "review_comment",
        ACTIVITY_COMMENT = "activity_comment"
    }
    enum category {
        SPAM = "spam",
        PERSONAL = "personal",
        NUDITY = "nudity"
    }
}
//# sourceMappingURL=CreateReportRequestDto.d.ts.map