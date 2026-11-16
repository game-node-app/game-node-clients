import { useQuery } from "@tanstack/react-query";
import { ApiError, RecapService } from "@repo/wrapper/server";
import type { RecapGoalDto } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { getRecapGoalQueryKey } from "./recapQueryKeys";

/**
 * `GET /v1/recap/goals/:year` (session). `target` is null when the user has no
 * goal; `finished` is still returned. Disabled for visitors, since the route
 * answers 401 without a session.
 */
export function useRecapGoal(year: number | undefined) {
  const userId = useUserId();

  return useQuery<RecapGoalDto, ApiError>({
    queryKey: getRecapGoalQueryKey(year, userId),
    queryFn: async () => {
      return RecapService.recapControllerGetGoalV1(year!);
    },
    enabled: !!userId && year != undefined,
  });
}
