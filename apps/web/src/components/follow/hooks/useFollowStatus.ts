import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import { FollowService, FollowStatusDto } from "@/wrapper/server";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useFollowStatus(
    followerUserId: string | undefined,
    followedUserId: string | undefined,
): ExtendedUseQueryResult<FollowStatusDto> {
    const queryClient = useQueryClient();
    const queryKey = ["follow", "status", followerUserId, followedUserId];
    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: queryKey.slice(0, 1),
        });
    };

    return {
        queryKey,
        invalidate,
        ...useQuery({
            queryKey,
            queryFn: () => {
                if (!followerUserId || !followedUserId) return null;
                return FollowService.followControllerGetFollowerStatusV1(
                    followerUserId,
                    followedUserId,
                );
            },
        }),
    };
}
