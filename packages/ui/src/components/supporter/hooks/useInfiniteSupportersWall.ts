import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import {
  ApiError,
  SupportersService,
  type PaginatedSupportersResponseDto,
} from "@repo/wrapper/server";
import type { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import { SUPPORTERS_WALL_QUERY_KEY } from "./supporterQueryKeys";

export interface UseInfiniteSupportersWallProps {
  /** Page size; the wall uses 48 on web and 24 on mobile (design D11). */
  limit?: number;
}

/**
 * Public supporters wall, paged by `offset` (design D11). The next offset is
 * the number of loaded pages times the page size; the server's `hasNextPage`
 * ends the list. `SUPPORTERS_WALL_QUERY_KEY` is the prefix the preference
 * mutation invalidates when someone opts out.
 */
export function useInfiniteSupportersWall({
  limit = 20,
}: UseInfiniteSupportersWallProps = {}): ExtendedUseInfiniteQueryResult<PaginatedSupportersResponseDto> {
  const queryClient = useQueryClient();
  const queryKey = [...SUPPORTERS_WALL_QUERY_KEY, limit];

  return {
    queryKey,
    invalidate: () => {
      void queryClient.invalidateQueries({
        queryKey: SUPPORTERS_WALL_QUERY_KEY,
      });
    },
    ...useInfiniteQuery<
      PaginatedSupportersResponseDto,
      ApiError,
      InfiniteData<PaginatedSupportersResponseDto>,
      QueryKey,
      number
    >({
      queryKey,
      queryFn: ({ pageParam }) =>
        SupportersService.supportersControllerGetWallV1(pageParam, limit),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.pagination.hasNextPage ? pages.length * limit : undefined,
      staleTime: 5 * 60_000,
    }),
  };
}
