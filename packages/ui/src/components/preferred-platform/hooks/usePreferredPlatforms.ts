import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExtendedUseQueryResult } from "#@/util";
import {
  PreferredPlatformDto,
  PreferredPlatformService,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components";

export function usePreferredPlatforms(): ExtendedUseQueryResult<
  PreferredPlatformDto[]
> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = ["preferred", "platforms", "own"];
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery({
      queryKey,
      queryFn: async () => {
        return PreferredPlatformService.preferredPlatformControllerFindAllByUserIdV1();
      },
      enabled: !!userId,
    }),
  };
}
