import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Profile, ProfileService } from "../../../../../wrapper/src/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useUserProfile(
  userId: string | undefined | null,
): ExtendedUseQueryResult<Profile> {
  const queryClient = useQueryClient();
  const queryKey = ["userProfile", userId];
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        return ProfileService.profileControllerFindOneByIdV1(userId!);
      },
      enabled: !!userId,
      retry: 1,
    }),
    invalidate,
    queryKey,
  };
}
