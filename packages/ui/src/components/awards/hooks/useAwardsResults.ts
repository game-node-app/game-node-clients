import { useQuery } from "@tanstack/react-query";
import { ApiError, AwardsService } from "@repo/wrapper/server";
import type { AwardsCategoryResult } from "@repo/wrapper/server";
import { getAwardsResultsQueryKey } from "./awardsQueryKeys";

/**
 * `GET /v1/awards/:eventId/results` (public). An empty array means results are
 * not computed yet; the screen shows the `resultsDate` instead of winners.
 */
export function useAwardsResults(eventId: number | undefined) {
  return useQuery<AwardsCategoryResult[], ApiError>({
    queryKey: getAwardsResultsQueryKey(eventId),
    queryFn: async () => {
      return AwardsService.awardsControllerGetResultsByEventIdV1(eventId!);
    },
    enabled: !!eventId,
  });
}
