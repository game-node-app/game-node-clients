// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BillingOffersResponseDto, BillingService } from "@repo/wrapper/server";
import { useSupporterOffers } from "../../../../../packages/ui/src/components/supporter/hooks/useSupporterOffers";

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "SupporterOffersQueryClientWrapper";
  return Wrapper;
}

function createClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("normalizes BRL offers and preserves the server display amounts", async () => {
  const client = createClient();
  const response = {
    currency: "BRL",
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 990,
        displayAmount: "R$ 9,90",
      },
      {
        plan: "supporter",
        interval: "yearly",
        amount: 9900,
        displayAmount: "R$ 99,00",
      },
    ],
  } as unknown as BillingOffersResponseDto;

  const offers = vi
    .spyOn(BillingService, "billingControllerGetOffersV1")
    .mockResolvedValue(response);

  const hook = renderHook(() => useSupporterOffers(), {
    wrapper: createWrapper(client),
  });

  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

  expect(offers).toHaveBeenCalledTimes(1);
  expect(hook.result.current.data).toEqual({
    currency: "BRL",
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 990,
        displayAmount: "R$ 9,90",
      },
      {
        plan: "supporter",
        interval: "yearly",
        amount: 9900,
        displayAmount: "R$ 99,00",
      },
    ],
  });
  expect(hook.result.current.queryKey).toEqual(["billing", "offers"]);

  const query = client
    .getQueryCache()
    .find({ queryKey: ["billing", "offers"] });
  const options = query?.options as unknown as
    | { staleTime?: unknown; retry?: unknown }
    | undefined;
  expect(options?.staleTime).toBe(5 * 60 * 1000);
  expect(options?.retry).toBe(1);
});

it("normalizes USD offers", async () => {
  vi.spyOn(BillingService, "billingControllerGetOffersV1").mockResolvedValue({
    currency: "USD",
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 190,
        displayAmount: "US$ 1.90",
      },
      {
        plan: "supporter",
        interval: "yearly",
        amount: 1900,
        displayAmount: "US$ 19.00",
      },
    ],
  } as unknown as BillingOffersResponseDto);

  const hook = renderHook(() => useSupporterOffers(), {
    wrapper: createWrapper(createClient()),
  });

  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

  expect(hook.result.current.data).toEqual({
    currency: "USD",
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 190,
        displayAmount: "US$ 1.90",
      },
      {
        plan: "supporter",
        interval: "yearly",
        amount: 1900,
        displayAmount: "US$ 19.00",
      },
    ],
  });
});

it("drops unknown intervals and reports an unknown currency as unavailable", async () => {
  vi.spyOn(BillingService, "billingControllerGetOffersV1").mockResolvedValue({
    currency: "EUR",
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 990,
        displayAmount: "R$ 9,90",
      },
      {
        plan: "supporter",
        interval: "weekly",
        amount: 123,
        displayAmount: "R$ 1,23",
      },
      {
        plan: "supporter",
        interval: null,
        amount: 456,
        displayAmount: "R$ 4,56",
      },
    ],
  } as unknown as BillingOffersResponseDto);

  const hook = renderHook(() => useSupporterOffers(), {
    wrapper: createWrapper(createClient()),
  });

  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

  expect(hook.result.current.data).toEqual({
    currency: null,
    offers: [
      {
        plan: "supporter",
        interval: "monthly",
        amount: 990,
        displayAmount: "R$ 9,90",
      },
    ],
  });
});
