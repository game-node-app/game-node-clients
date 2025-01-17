export type CreateCommentDto = {
    /**
     * UUID of the target entity. Comments can only be attributed to
     * UUID based entities.
     */
    sourceId: string;
    sourceType: CreateCommentDto.sourceType;
    content: string;
    childOf?: string;
};
export declare namespace CreateCommentDto {
    enum sourceType {
        REVIEW = "review",
        ACTIVITY = "activity"
    }
}
//# sourceMappingURL=CreateCommentDto.d.ts.map