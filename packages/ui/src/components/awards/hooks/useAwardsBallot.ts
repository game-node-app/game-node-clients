import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { ExtendedUseQueryResult } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { AwardsBallot } from "#@/components/awards/types";
import { toAwardsBallot } from "#@/components/awards/types";
import { getAwardsBallotQueryKey } from "./awardsQueryKeys";

/** The ballot changes with votes and the phase; keep it fresh while open. */
export const AWARDS_BALLOT_STALE_TIME = 60 * 1000;

/**
 * `GET /v1/awards/:eventId/ballot` (session). A visitor has no ballot: the
 * query stays disabled instead of treating a 401 as an empty ballot (spec:
 * Cédula exige sessão).
 */
export function useAwardsBallot(
  eventId: number | undefined,
): ExtendedUseQueryResult<AwardsBallot> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getAwardsBallotQueryKey(eventId, userId);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery<AwardsBallot, ApiError>({
      queryKey,
      queryFn: async () => {
        return toAwardsBallot(
          await AwardsService.awardsBallotControllerGetBallotV1(eventId!),
        );
      },
      enabled: !!eventId && !!userId,
      staleTime: AWARDS_BALLOT_STALE_TIME,
    }),
  };
}
