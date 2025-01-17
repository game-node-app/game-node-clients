export type FindAllCommentsDto = {
    sourceId: string;
    sourceType: FindAllCommentsDto.sourceType;
    offset?: number;
    limit?: number;
    orderBy?: Record<string, any>;
};
export declare namespace FindAllCommentsDto {
    enum sourceType {
        REVIEW = "review",
        ACTIVITY = "activity"
    }
}
//# sourceMappingURL=FindAllCommentsDto.d.ts.map