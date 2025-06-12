import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseInfiniteQueryResult } from "#@/util";
import {
  GetPostsPaginatedReponseDto,
  PostsService,
} from "@repo/wrapper/server";

export interface GetPostsRequestDto {
  postId?: string;
  gameId?: number;
  profileUserId?: string;
  limit?: number;
}

export interface GetPostsPageParam {
  lastCreatedAt?: string; // ISO Date format
  lastId?: string; // UUID of the last entry
}

export function useInfinitePosts({
  postId,
  gameId,
  profileUserId,
  limit = 20,
}: GetPostsRequestDto): ExtendedUseInfiniteQueryResult<GetPostsPaginatedReponseDto> {
  const queryClient = useQueryClient();
  const queryKey = ["posts", "infinite", postId, gameId, profileUserId, limit];

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: queryKey.slice(0, 2),
    });
  };

  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam }) => {
        return PostsService.postsControllerFindAllWithPaginationV1(
          postId,
          gameId,
          profileUserId,
          pageParam.lastCreatedAt,
          pageParam.lastId,
          limit,
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
