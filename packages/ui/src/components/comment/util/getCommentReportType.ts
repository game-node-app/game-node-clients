import { UserComment } from "#@/components";
import { CreateReportRequestDto } from "@repo/wrapper/server";

export function getCommentReportType(comment: UserComment) {
  if (Object.hasOwn(comment, "reviewId")) {
    return CreateReportRequestDto.sourceType.REVIEW_COMMENT;
  }
  if (Object.hasOwn(comment, "activityId")) {
    return CreateReportRequestDto.sourceType.ACTIVITY_COMMENT;
  }
  if (Object.hasOwn(comment, "postId")) {
    return CreateReportRequestDto.sourceType.POST_COMMENT;
  }

  throw new Error(`Unmapped comment source type for statistics: ${comment}`);
}
