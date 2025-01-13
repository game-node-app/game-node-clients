import { CommentService, FindAllCommentsDto } from "@/wrapper/server";
import sourceType = FindAllCommentsDto.sourceType;
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { UserComment } from "../types";

/**
 * Retrieves a single comment based on criteria.
 * Will only be enabled if commentId is not null.
 */
export function useComment<T extends UserComment = UserComment>(
    commentId: string | undefined,
    sourceType: sourceType,
): UseQueryResult<T> {
    return useQuery({
        queryKey: ["comment", "findOne", sourceType, commentId],
        queryFn: async () => {
            if (!commentId) {
                return null;
            }

            return CommentService.commentControllerFindOneByIdV1(
                sourceType.valueOf(),
                commentId,
            );
        },
        enabled: commentId != undefined,
        retry: 1,
        staleTime: Infinity,
    });
}
