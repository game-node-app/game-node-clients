import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, BillingService } from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { SupporterStatus } from "../types";
import { normalizeSupporterStatus } from "../util/normalizeSupporter";
import {
  getSupporterStatusQueryKey,
  SUPPORTER_QUERY_KEYS,
} from "./supporterQueryKeys";

/**
 * Server-authoritative entitlement. Web defaults (`staleTime: Infinity`,
 * `refetchOnMount: false`) must not apply here: checkout returns and webhook
 * reconciliation depend on a fresh read every time the surface mounts.
 */
export function useSupporterStatus(): ExtendedUseQueryResult<SupporterStatus> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getSupporterStatusQueryKey(userId);

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: SUPPORTER_QUERY_KEYS.me,
    });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery<SupporterStatus, ApiError>({
      queryKey,
      queryFn: async () => {
        const response = await BillingService.billingControllerGetMeV1();

        return normalizeSupporterStatus(response);
      },
      enabled: !!userId,
      staleTime: 0,
      refetchOnMount: "always",
      refetchOnReconnect: true,
    }),
  };
}
