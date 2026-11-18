import {
  ActivityCommentDto,
  CreateCommentDto,
  PostCommentDto,
  ReviewCommentDto,
} from "@repo/wrapper/server";

export type UserComment =
  | ReviewCommentDto
  | ActivityCommentDto
  | PostCommentDto;

export type CommentSource = Pick<CreateCommentDto, "sourceId" | "sourceType">;
