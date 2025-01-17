export type HandleReportRequestDto = {
    action: HandleReportRequestDto.action;
    deleteReportedContent: boolean;
};
export declare namespace HandleReportRequestDto {
    enum action {
        DISCARD = "discard",
        ALERT = "alert",
        SUSPEND = "suspend",
        BAN = "ban"
    }
}
//# sourceMappingURL=HandleReportRequestDto.d.ts.map