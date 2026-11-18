import { CreateCommentDto, CreateReportRequestDto } from "@repo/wrapper/server";

const reportTypes = {
  [CreateCommentDto.sourceType.REVIEW]:
    CreateReportRequestDto.sourceType.REVIEW_COMMENT,
  [CreateCommentDto.sourceType.POST]:
    CreateReportRequestDto.sourceType.POST_COMMENT,
  [CreateCommentDto.sourceType.ACTIVITY]:
    CreateReportRequestDto.sourceType.ACTIVITY_COMMENT,
} satisfies Record<
  CreateCommentDto.sourceType,
  CreateReportRequestDto.sourceType
>;

export function getCommentReportType(sourceType: CreateCommentDto.sourceType) {
  return reportTypes[sourceType];
}
