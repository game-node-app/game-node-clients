import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  ApiError,
  BillingCheckoutResponseDto,
  BillingService,
  CheckoutRequestDto,
} from "@repo/wrapper/server";
import type { SupporterCheckoutVariables, SupporterInterval } from "../types";

function toCheckoutInterval(interval: SupporterInterval) {
  return interval === "yearly"
    ? CheckoutRequestDto.interval.YEARLY
    : CheckoutRequestDto.interval.MONTHLY;
}

/**
 * Creates a Stripe Checkout session. Only the selected interval and an
 * optional locale are sent; price, amount, currency and Stripe identifiers
 * always come from the server. Entitlement is never written to the cache.
 */
export function useSupporterCheckout(): UseMutationResult<
  BillingCheckoutResponseDto,
  ApiError,
  SupporterCheckoutVariables
> {
  return useMutation<
    BillingCheckoutResponseDto,
    ApiError,
    SupporterCheckoutVariables
  >({
    mutationFn: async ({ interval, locale }) => {
      const request: CheckoutRequestDto = {
        interval: toCheckoutInterval(interval),
      };

      if (locale !== undefined) request.locale = locale;

      return BillingService.billingControllerCreateCheckoutV1(request);
    },
  });
}
