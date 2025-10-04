import {
  CommentService,
  FindAllCommentsDto,
} from "../../../../../wrapper/src/server";
import { useQuery } from "@tanstack/react-query";
import { UserComment } from "../types";
import sourceType = FindAllCommentsDto.sourceType;

/**
 * Retrieves a single comment based on criteria.
 * Will only be enabled if commentId is not null.
 */
export function useComment<T extends UserComment = UserComment>(
  commentId: string | undefined,
  sourceType: sourceType,
) {
  return useQuery({
    queryKey: ["comment", "findOne", sourceType, commentId],
    queryFn: async () => {
      if (!commentId) {
        return null;
      }

      const comment = await CommentService.commentControllerFindOneByIdV1(
        sourceType.valueOf(),
        commentId,
      );

      return comment as T;
    },
    enabled: commentId != undefined,
    retry: 1,
  });
}
