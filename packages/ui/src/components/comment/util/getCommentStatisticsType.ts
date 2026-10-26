import { UserComment } from "#@/components";
import { StatisticsSourceRequestDto } from "@repo/wrapper/server";

export function getCommentStatisticsType(comment: UserComment) {
  if ("reviewId" in comment) {
    return StatisticsSourceRequestDto.sourceType.REVIEW_COMMENT;
  }
  if ("postId" in comment) {
    return StatisticsSourceRequestDto.sourceType.POST_COMMENT;
  }
  if ("activityId" in comment) {
    return StatisticsSourceRequestDto.sourceType.ACTIVITY_COMMENT;
  }

  throw new Error(`Unmapped comment source type for statistics: ${comment}`);
}
