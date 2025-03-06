import { UserComment } from "#@/components/comment/types";

export function getCommentSourceId(comment: UserComment) {
  if ("reviewId" in comment) {
    return comment.reviewId!;
  }
  if ("postId" in comment) {
    return comment.postId!;
  }

  if ("activityId" in comment) {
    return comment.activityId!;
  }

  throw new Error(`Unmapped comment source type: ${comment}`);
}
