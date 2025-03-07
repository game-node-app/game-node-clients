import {
  ActivityCommentDto,
  PostCommentDto,
  ReviewCommentDto,
} from "@repo/wrapper/server";

export type UserComment =
  | ReviewCommentDto
  | ActivityCommentDto
  | PostCommentDto;
