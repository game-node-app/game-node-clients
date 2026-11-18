import {
  CreateCommentDto,
  StatisticsSourceRequestDto,
} from "@repo/wrapper/server";

const statisticsTypes = {
  [CreateCommentDto.sourceType.REVIEW]:
    StatisticsSourceRequestDto.sourceType.REVIEW_COMMENT,
  [CreateCommentDto.sourceType.POST]:
    StatisticsSourceRequestDto.sourceType.POST_COMMENT,
  [CreateCommentDto.sourceType.ACTIVITY]:
    StatisticsSourceRequestDto.sourceType.ACTIVITY_COMMENT,
} satisfies Record<
  CreateCommentDto.sourceType,
  StatisticsSourceRequestDto.sourceType
>;

export function getCommentStatisticsType(
  sourceType: CreateCommentDto.sourceType,
) {
  return statisticsTypes[sourceType];
}
