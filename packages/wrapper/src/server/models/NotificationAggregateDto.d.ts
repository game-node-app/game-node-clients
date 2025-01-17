import type { Notification } from './Notification';
export type NotificationAggregateDto = {
    sourceId: (string | number);
    category: NotificationAggregateDto.category;
    sourceType: NotificationAggregateDto.sourceType;
    notifications: Array<Notification>;
};
export declare namespace NotificationAggregateDto {
    enum category {
        FOLLOW = "follow",
        LIKE = "like",
        COMMENT = "comment",
        WATCH = "watch",
        ALERT = "alert",
        MENTION = "mention"
    }
    enum sourceType {
        GAME = "game",
        REVIEW = "review",
        REVIEW_COMMENT = "review_comment",
        ACTIVITY = "activity",
        ACTIVITY_COMMENT = "activity_comment",
        PROFILE = "profile",
        IMPORTER = "importer",
        REPORT = "report"
    }
}
//# sourceMappingURL=NotificationAggregateDto.d.ts.map