import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, RecapService } from "@repo/wrapper/server";
import type { RecapGoalDto } from "@repo/wrapper/server";
import { createErrorNotification } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { RecapGoalVariables } from "#@/components/recap/types";
import { getRecapGoalQueryKey } from "./recapQueryKeys";

/**
 * `PUT /v1/recap/goals/:year` (session). The response is authoritative for the
 * target and the finished count, so it replaces the cached goal directly.
 */
export function useRecapGoalMutation(year: number | undefined) {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getRecapGoalQueryKey(year, userId);

  return useMutation<RecapGoalDto, ApiError, RecapGoalVariables>({
    mutationFn: async ({ target }) => {
      return RecapService.recapControllerSetGoalV1(year!, { target });
    },
    onSuccess: (goal) => {
      if (!userId) return;
      queryClient.setQueryData<RecapGoalDto>(queryKey, goal);
    },
    onError: (error) => {
      createErrorNotification(error);
    },
  });
}
