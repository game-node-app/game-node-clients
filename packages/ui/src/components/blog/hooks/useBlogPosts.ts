import { ExtendedUseQueryResult } from "#@/util";
import {
  BlogPostService,
  FindAllBlogPostResponseDto,
} from "@repo/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UseBlogPostsOptions {
  tag?: string;
  includeDraft?: boolean;
  limit?: number;
  offset?: number;
}

export function useBlogPosts(
  dto: UseBlogPostsOptions,
): ExtendedUseQueryResult<FindAllBlogPostResponseDto> {
  const queryClient = useQueryClient();

  const queryKey = [
    "blog",
    "posts",
    dto.tag,
    dto.includeDraft,
    dto.limit,
    dto.offset,
  ];

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKey.slice(0, 2),
    });
  };

  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        return BlogPostService.blogPostControllerFindAllV1(
          dto.tag,
          dto.includeDraft,
          dto.limit,
          dto.offset,
        );
      },
    }),
    queryKey,
    invalidate,
  };
}
