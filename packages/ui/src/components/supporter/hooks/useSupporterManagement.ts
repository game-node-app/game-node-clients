import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ApiError,
  BillingPortalResponseDto,
  BillingService,
  BillingSubscriptionActionResponseDto,
  PortalRequestDto,
} from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import type { SupporterPortalVariables, SupporterStatus } from "../types";
import {
  getSupporterStatusQueryKey,
  SUPPORTER_QUERY_KEYS,
} from "./supporterQueryKeys";

export type SupporterManagement = {
  portal: UseMutationResult<
    BillingPortalResponseDto,
    ApiError,
    SupporterPortalVariables
  >;
  cancel: UseMutationResult<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >;
  restore: UseMutationResult<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >;
};

/**
 * Self-service management actions. Cancel/restore responses are authoritative
 * for the fields they return, so the cached status row is merged immediately
 * and then invalidated so the webhook can reconcile the rest. `isSupporter`
 * is never invented: a missing cache row is simply left for the refetch.
 */
export function useSupporterManagement(): SupporterManagement {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const reconcileStatus = (data: BillingSubscriptionActionResponseDto) => {
    if (!userId) return;

    const statusQueryKey = getSupporterStatusQueryKey(userId);

    queryClient.setQueryData<SupporterStatus>(statusQueryKey, (previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        status: typeof data.status === "string" ? data.status : previous.status,
        cancelAtPeriodEnd:
          typeof data.cancelAtPeriodEnd === "boolean"
            ? data.cancelAtPeriodEnd
            : previous.cancelAtPeriodEnd,
        periodEnd:
          typeof data.periodEnd === "string" || data.periodEnd === null
            ? data.periodEnd
            : previous.periodEnd,
      };
    });

    // Mark the prefix stale but do not refetch immediately: the cancel/restore
    // response is authoritative and the webhook may need a moment to update the
    // persisted row. A later mount/focus refetch reconciles the cache.
    void queryClient.invalidateQueries({
      queryKey: SUPPORTER_QUERY_KEYS.me,
      refetchType: "none",
    });
  };

  const portal = useMutation<
    BillingPortalResponseDto,
    ApiError,
    SupporterPortalVariables
  >({
    mutationFn: async ({ locale }) => {
      const request: PortalRequestDto = {};

      if (locale !== undefined) request.locale = locale;

      return BillingService.billingControllerCreatePortalV1(request);
    },
  });

  const cancel = useMutation<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >({
    mutationFn: () => BillingService.billingControllerCancelV1(),
    onSuccess: reconcileStatus,
  });

  const restore = useMutation<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >({
    mutationFn: () => BillingService.billingControllerRestoreV1(),
    onSuccess: reconcileStatus,
  });

  return { portal, cancel, restore };
}
