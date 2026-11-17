import { useQuery } from "@tanstack/react-query";
import { ApiError, RecapService } from "@repo/wrapper/server";
import { isMockRecap } from "#@/components/recap/hooks/mockRecap";
import type { RecapStatus } from "#@/components/recap/types";
import { toRecapStatus } from "#@/components/recap/types";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { retryUnlessHidden } from "#@/util";
import { getRecapStatusQueryKey } from "./recapQueryKeys";

/**
 * Given a userID, returns the recap status for the current year.
 * This includes whether the recap is created, if the user is eligible for the
 * recap and the server-computed `phase` of the requested year.
 * The eligibility is determined by the user's account creation date and the target year.
 * @param userId
 * @param year
 */
export function useRecapStatus(
  userId: string | undefined,
  year: number | undefined,
) {
  const viewerId = useUserId();

  return useQuery<RecapStatus, ApiError>({
    queryKey: getRecapStatusQueryKey(userId, year, viewerId),
    queryFn: async () => {
      if (isMockRecap(userId)) {
        return { isRecapCreated: true, isRecapEligible: true, phase: "live" };
      }
      return toRecapStatus(
        await RecapService.recapControllerGetRecapStatusV1(userId!, year!),
      );
    },
    enabled: userId != undefined && year != undefined,
    // A hidden library answers 404 for another user: don't retry.
    retry: retryUnlessHidden,
  });
}
