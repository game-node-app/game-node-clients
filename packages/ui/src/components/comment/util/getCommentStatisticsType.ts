import { UserComment } from "#@/components";
import { FindOneStatisticsDto } from "@repo/wrapper/server";

export function getCommentStatisticsType(comment: UserComment) {
  if ("reviewId" in comment) {
    return FindOneStatisticsDto.sourceType.REVIEW_COMMENT;
  }
  if ("postId" in comment) {
    return FindOneStatisticsDto.sourceType.POST_COMMENT;
  }
  if ("activityId" in comment) {
    return FindOneStatisticsDto.sourceType.ACTIVITY_COMMENT;
  }

  throw new Error(`Unmapped comment source type for statistics: ${comment}`);
}
