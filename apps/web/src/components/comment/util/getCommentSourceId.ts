import { UserComment } from "@/components/comment/types";

export function getCommentSourceId(comment: UserComment) {
    if ("reviewId" in comment) {
        return comment.reviewId!;
    }

    return comment.activityId!;
}
