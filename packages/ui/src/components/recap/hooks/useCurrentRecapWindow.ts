import { useQuery } from "@tanstack/react-query";
import { ApiError, RecapService } from "@repo/wrapper/server";
import type { RecapCurrent } from "#@/components/recap/types";
import { toRecapCurrent } from "#@/components/recap/types";
import { getCurrentRecapWindowQueryKey } from "./recapQueryKeys";

/** The window changes when the year rolls over, so it cannot stay fresh forever. */
export const CURRENT_RECAP_WINDOW_STALE_TIME = 5 * 60 * 1000;

/**
 * `GET /v1/recap/current` (public): the current Recap year and phase. Never
 * returns `upcoming`; a future year is observed through the status read.
 */
export function useCurrentRecapWindow() {
  return useQuery<RecapCurrent, ApiError>({
    queryKey: getCurrentRecapWindowQueryKey(),
    queryFn: async () => {
      return toRecapCurrent(
        await RecapService.recapControllerGetCurrentRecapV1(),
      );
    },
    staleTime: CURRENT_RECAP_WINDOW_STALE_TIME,
  });
}
