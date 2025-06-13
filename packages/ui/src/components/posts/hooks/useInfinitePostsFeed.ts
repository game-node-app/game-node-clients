import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  type GetPostsPaginatedResponseDto,
  PostsFeedService,
} from "@repo/wrapper/server";
import { ExtendedUseInfiniteQueryResult } from "#@/util";
import { GetPostsPageParam } from "#@/components/posts/hooks/useInfinitePosts";

export type PostsFeedCriteria = Parameters<
  typeof PostsFeedService.postsFeedControllerBuildFeedV1
>[0];

export type GetPostsFeedRequestDto = {
  criteria?: "following" | "all";
  limit?: number;
  postId?: string;
};

export function useInfinitePostsFeed({
  criteria = "all",
  limit = 20,
  postId,
}: GetPostsFeedRequestDto): ExtendedUseInfiniteQueryResult<GetPostsPaginatedResponseDto> {
  const queryClient = useQueryClient();
  const queryKey = ["posts", "feed", criteria, limit, postId];

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKey.slice(0, 2),
    });
  };

  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam }) => {
        return PostsFeedService.postsFeedControllerBuildFeedV1(
          criteria,
          pageParam.lastCreatedAt,
          pageParam.lastId,
          limit,
          postId,
        );
      },
      initialPageParam: {
        lastCreatedAt: undefined,
        lastId: undefined,
      } as GetPostsPageParam,
      getNextPageParam: (lastPage, _, lastPageParam) => {
        if (
          lastPage &&
          lastPage.pagination &&
          lastPage.pagination.hasNextPage &&
          lastPage.data?.at(-1)
        ) {
          const lastElement = lastPage.data.at(-1)!;
          return {
            lastCreatedAt: lastElement.createdAt,
            lastId: lastElement.id,
          };
        }

        return undefined;
      },
    }),
    queryKey,
    invalidate,
  };
}
