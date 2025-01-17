import type { ActivityComment } from './ActivityComment';
import type { Profile } from './Profile';
import type { Review } from './Review';
import type { ReviewComment } from './ReviewComment';
export type Report = {
    id: number;
    /**
     * Indexed to improve speed when filtering by type.
     */
    sourceType: Report.sourceType;
    category: Report.category;
    /**
     * User-submitted reason for report.
     */
    reason: string | null;
    /**
     * Profile that is being target of a report
     */
    targetProfile: Profile;
    targetProfileUserId: string;
    /**
     * User responsible for report.
     */
    profile: Profile;
    profileUserId: string;
    /**
     * User responsible for closing this report
     */
    closeProfile: Profile | null;
    closeProfileUserId: string | null;
    targetReview: Review | null;
    targetReviewId: string | null;
    targetReviewComment: ReviewComment | null;
    targetReviewCommentId: string | null;
    targetActivityComment: ActivityComment | null;
    targetActivityCommentId: string | null;
    isClosed: boolean;
    /**
     * Action taken when closing this report
     */
    closeHandleAction: Report.closeHandleAction | null;
    createdAt: string;
    updatedAt: string;
};
export declare namespace Report {
    /**
     * Indexed to improve speed when filtering by type.
     */
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
    /**
     * Action taken when closing this report
     */
    enum closeHandleAction {
        DISCARD = "discard",
        ALERT = "alert",
        SUSPEND = "suspend",
        BAN = "ban"
    }
}
//# sourceMappingURL=Report.d.ts.map