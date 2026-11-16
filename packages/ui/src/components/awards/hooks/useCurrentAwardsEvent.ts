import { useQuery } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { CurrentAwardsEvent } from "#@/components/awards/types";
import { toCurrentAwardsEvent } from "#@/components/awards/types";
import { isAwardsNotFoundError, retryUnlessNotFound } from "./awardsErrors";
import { getCurrentAwardsEventQueryKey } from "./awardsQueryKeys";

/** The phase changes with the clock, so the event cannot stay fresh forever. */
export const CURRENT_AWARDS_EVENT_STALE_TIME = 5 * 60 * 1000;

/**
 * Latest Awards event whose first phase has started. A 404 means "no event has
 * started yet" and is exposed as `null` instead of an error (spec: Fase do
 * Awards vinda do servidor).
 */
export function useCurrentAwardsEvent() {
  return useQuery<CurrentAwardsEvent | null, ApiError>({
    queryKey: getCurrentAwardsEventQueryKey(),
    queryFn: async () => {
      try {
        return toCurrentAwardsEvent(
          await AwardsService.awardsControllerGetCurrentEventV1(),
        );
      } catch (error) {
        if (isAwardsNotFoundError(error)) return null;
        throw error;
      }
    },
    staleTime: CURRENT_AWARDS_EVENT_STALE_TIME,
    retry: retryUnlessNotFound,
  });
}
