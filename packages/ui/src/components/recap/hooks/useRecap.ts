import { useQuery } from "@tanstack/react-query";
import { ApiError, RecapService } from "@repo/wrapper/server";
import {
  buildMockRecap,
  isMockRecap,
} from "#@/components/recap/hooks/mockRecap";
import type { YearRecap } from "#@/components/recap/types";
import { toYearRecap } from "#@/components/recap/types";
import { getRecapQueryKey } from "./recapQueryKeys";

/**
 * `GET /v1/recap/:year/:userId` (public). The status read is public too, so
 * callers gate this only with `enabled` until `isRecapCreated` is true; a
 * missing Recap is not a 200 response.
 */
export function useRecap(
  userId: string | undefined,
  targetYear: number | undefined,
  options?: { enabled?: boolean },
) {
  return useQuery<YearRecap, ApiError>({
    queryKey: getRecapQueryKey(targetYear, userId),
    queryFn: async () => {
      if (isMockRecap(userId)) {
        return toYearRecap(buildMockRecap(userId!, targetYear!));
      }
      return toYearRecap(
        await RecapService.recapControllerGetRecapByYearV1(
          userId!,
          targetYear!,
        ),
      );
    },
    enabled: !!userId && targetYear != undefined && (options?.enabled ?? true),
  });
}
