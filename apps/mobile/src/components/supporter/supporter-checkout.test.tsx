// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BillingCheckoutResponseDto,
  BillingService,
  CheckoutRequestDto,
} from "@repo/wrapper/server";
import { useSupporterCheckout } from "../../../../../packages/ui/src/components/supporter/hooks/useSupporterCheckout";

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "SupporterCheckoutQueryClientWrapper";
  return Wrapper;
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("sends only the interval and the optional locale", async () => {
  const client = createClient();
  const checkout = vi
    .spyOn(BillingService, "billingControllerCreateCheckoutV1")
    .mockResolvedValue({
      url: "https://checkout.stripe.com/session",
    } as unknown as BillingCheckoutResponseDto);

  const hook = renderHook(() => useSupporterCheckout(), {
    wrapper: createWrapper(client),
  });

  const yearly = await hook.result.current.mutateAsync({
    interval: "yearly",
    locale: "pt-BR",
  });

  expect(yearly).toEqual({ url: "https://checkout.stripe.com/session" });
  expect(checkout).toHaveBeenCalledTimes(1);
  expect(checkout.mock.calls[0][0]).toStrictEqual({
    interval: CheckoutRequestDto.interval.YEARLY,
    locale: "pt-BR",
  });

  await hook.result.current.mutateAsync({ interval: "monthly" });

  expect(checkout).toHaveBeenCalledTimes(2);
  expect(checkout.mock.calls[1][0]).toStrictEqual({
    interval: CheckoutRequestDto.interval.MONTHLY,
  });

  // The checkout mutation never writes entitlement or status.
  expect(client.getQueryData(["billing", "me", "user-1"])).toBeUndefined();
});
