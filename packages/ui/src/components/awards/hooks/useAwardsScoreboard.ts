import { useQuery } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { AwardsScoreboard } from "#@/components/awards/types";
import { toAwardsScoreboard } from "#@/components/awards/types";
import { isAwardsNotFoundError, retryUnlessNotFound } from "./awardsErrors";
import { getAwardsScoreboardQueryKey } from "./awardsQueryKeys";

/**
 * `GET /v1/awards/:eventId/scoreboard/:userId` (public). Before results exist
 * the server answers 404; that is exposed as `null` and the "Seu placar" block
 * is omitted without an error (spec: Placar indisponível).
 */
export function useAwardsScoreboard(
  eventId: number | undefined,
  userId: string | undefined,
) {
  return useQuery<AwardsScoreboard | null, ApiError>({
    queryKey: getAwardsScoreboardQueryKey(eventId, userId),
    queryFn: async () => {
      try {
        return toAwardsScoreboard(
          await AwardsService.awardsControllerGetScoreboardV1(
            eventId!,
            userId!,
          ),
        );
      } catch (error) {
        if (isAwardsNotFoundError(error)) return null;
        throw error;
      }
    },
    enabled: !!eventId && !!userId,
    retry: retryUnlessNotFound,
  });
}
