import { ExtendedUseInfiniteQueryResult } from "#@/util/types/ExtendedUseQueryResult";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  CancelablePromise,
  FollowInfoRequestDto,
  FollowInfoResponseDto,
  FollowService,
} from "../../../../../wrapper/src/server";

export function useInfiniteFollowInfo(
  dto: Omit<FollowInfoRequestDto, "offset">,
): ExtendedUseInfiniteQueryResult<FollowInfoResponseDto> {
  const limit = dto.limit || 10;
  const queryClient = useQueryClient();
  const queryKey = ["user", "follow", "info", dto];
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey,
    });
    queryClient.resetQueries({
      queryKey,
    });
  };
  return {
    ...useInfiniteQuery({
      queryKey,
      queryFn: async ({ pageParam }) => {
        return FollowService.followControllerGetFollowInfoV1({
          ...dto,
          offset: pageParam,
        }) as CancelablePromise<FollowInfoResponseDto>;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam, _allPageParams) => {
        return limit + lastPageParam;
      },
      placeholderData: keepPreviousData,
      staleTime: Infinity,
    }),
    invalidate,
    queryKey,
  };
}
