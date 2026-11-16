import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { ExtendedUseQueryResult } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { AwardsMyNominations } from "#@/components/awards/types";
import { toAwardsMyNominations } from "#@/components/awards/types";
import { getAwardsNominationsQueryKey } from "./awardsQueryKeys";

/**
 * `GET /v1/awards/:eventId/nominations/me` (session). Disabled for visitors, so
 * the nominations screen can show the public categories without a 401.
 */
export function useAwardsNominations(
  eventId: number | undefined,
): ExtendedUseQueryResult<AwardsMyNominations[]> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getAwardsNominationsQueryKey(eventId, userId);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery<AwardsMyNominations[], ApiError>({
      queryKey,
      queryFn: async () => {
        return toAwardsMyNominations(
          await AwardsService.awardsNominationControllerGetMyNominationsV1(
            eventId!,
          ),
        );
      },
      enabled: !!eventId && !!userId,
    }),
  };
}
