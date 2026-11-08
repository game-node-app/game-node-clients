import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, BillingService } from "@repo/wrapper/server";
import { ExtendedUseQueryResult } from "#@/util";
import type { SupporterOffers } from "../types";
import { normalizeSupporterOffers } from "../util/normalizeSupporter";
import {
  getSupporterOffersQueryKey,
  SUPPORTER_QUERY_KEYS,
} from "./supporterQueryKeys";

const OFFERS_STALE_TIME = 5 * 60 * 1000;

/**
 * Public supporter offers. Shared by the settings supporter surface and the
 * landing pricing section, so the cache is reused across them.
 */
export function useSupporterOffers(): ExtendedUseQueryResult<SupporterOffers> {
  const queryClient = useQueryClient();
  const queryKey = getSupporterOffersQueryKey();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: SUPPORTER_QUERY_KEYS.offers,
    });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery<SupporterOffers, ApiError>({
      queryKey,
      queryFn: async () => {
        const response = await BillingService.billingControllerGetOffersV1();

        return normalizeSupporterOffers(response);
      },
      staleTime: OFFERS_STALE_TIME,
      retry: 1,
    }),
  };
}
