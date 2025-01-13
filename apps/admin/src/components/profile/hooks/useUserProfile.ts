import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile, ProfileService } from "@/wrapper/server";
import { ExtendedUseQueryResult } from "@/util/types/ExtendedUseQueryResult";
import useUserId from "@/components/auth/hooks/useUserId";

export default function useUserProfile(
    userId: string | undefined,
): ExtendedUseQueryResult<Profile | undefined> {
    const queryClient = useQueryClient();
    const queryKey = ["userProfile", userId];
    const invalidate = () => queryClient.invalidateQueries({ queryKey });
    return {
        ...useQuery({
            queryKey: queryKey,
            queryFn: async () => {
                if (!userId) return null;
                return ProfileService.profileControllerFindOneByIdV1(userId);
            },
            enabled: !!userId,
            retry: 1,
        }),
        invalidate,
        queryKey,
    };
}
