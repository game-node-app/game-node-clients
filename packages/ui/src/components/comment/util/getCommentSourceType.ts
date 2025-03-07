import { UserComment } from "#@/components/comment/types";
import { CreateCommentDto } from "@repo/wrapper/server";

export function getCommentSourceType(comment: UserComment) {
  if ("reviewId" in comment) {
    return CreateCommentDto.sourceType.REVIEW;
  }
  if ("postId" in comment) {
    return CreateCommentDto.sourceType.POST;
  }
  if ("activityId" in comment) {
    return CreateCommentDto.sourceType.ACTIVITY;
  }

  throw new Error(`Unmapped comment source type: ${comment}`);
}
