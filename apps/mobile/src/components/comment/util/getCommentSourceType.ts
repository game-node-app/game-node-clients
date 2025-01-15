import { UserComment } from "@/components/comment/types";
import { CreateCommentDto } from "@repo/wrapper/server";

export function getCommentSourceType(comment: UserComment) {
    if ("reviewId" in comment) {
        return CreateCommentDto.sourceType.REVIEW;
    }

    return CreateCommentDto.sourceType.ACTIVITY;
}
