import { CancelablePromise, FollowInfoRequestDto, FollowInfoResponseDto, FollowService } from "@/wrapper/server";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseInfiniteQueryResult } from "@/util/types/ExtendedUseQueryResult";

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
            getNextPageParam: (lastPage, allPages, lastPageParam, allPageParams) => {
                return limit + lastPageParam;
            },
            staleTime: Infinity,
        }),
        invalidate,
        queryKey,
    };
}
