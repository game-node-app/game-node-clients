import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ProfileResponseDto,
  ProfileService,
} from "../../../../../wrapper/src/server";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export function useUserProfile(
  userId: string | undefined | null,
  options?: { enabled?: boolean },
): ExtendedUseQueryResult<ProfileResponseDto> {
  const queryClient = useQueryClient();
  const queryKey = ["userProfile", userId];
  const invalidate = () => queryClient.invalidateQueries({ queryKey });
  return {
    ...useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        return ProfileService.profileControllerFindOneByIdV1(userId!);
      },
      enabled: (options?.enabled ?? true) && !!userId,
      retry: 1,
    }),
    invalidate,
    queryKey,
  };
}
