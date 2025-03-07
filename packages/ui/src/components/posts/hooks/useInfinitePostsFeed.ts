import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  type GetPostsPaginatedReponseDto,
  PostsFeedService,
} from "@repo/wrapper/server";
import { ExtendedUseInfiniteQueryResult } from "#@/util";

export type PostsFeedCriteria = Parameters<
  typeof PostsFeedService.postsFeedControllerBuildFeedV1
>[0];

export type GetPostsFeedRequestDto = {
  criteria?: "following" | "all";
  limit?: number;
  lastCreatedAt?: string;
  lastId?: string;
  postId?: string;
};

type QueryPageParam = Pick<GetPostsFeedRequestDto, "lastCreatedAt" | "lastId">;

export function useInfinitePostsFeed({
  criteria = "all",
  lastId,
  lastCreatedAt,
  limit = 20,
  postId,
}: GetPostsFeedRequestDto): ExtendedUseInfiniteQueryResult<GetPostsPaginatedReponseDto> {
  const queryClient = useQueryClient();
  const queryKey = [
    "posts",
    "feed",
    criteria,
    limit,
    lastId,
    lastCreatedAt,
    postId,
  ];

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
      } as QueryPageParam,
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
