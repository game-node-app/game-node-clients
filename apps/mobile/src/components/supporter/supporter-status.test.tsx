// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BillingMeResponseDto, BillingService } from "@repo/wrapper/server";
import { useSupporterStatus } from "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus";
import { normalizeSupporterStatus } from "../../../../../packages/ui/src/components/supporter/util/normalizeSupporter";

const session = vi.hoisted(() => ({ id: undefined as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "SupporterStatusQueryClientWrapper";
  return Wrapper;
}

function createClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Mirror web's transactional defaults to prove the hook overrides them.
        staleTime: Infinity,
        refetchOnMount: false,
      },
    },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  session.id = undefined;
});

it("stays disabled without a userId and refetches on every mount with a userId", async () => {
  const client = createClient();
  const getMe = vi
    .spyOn(BillingService, "billingControllerGetMeV1")
    .mockResolvedValue({
      isSupporter: true,
      status: "active",
      plan: "supporter",
      billingInterval: "month",
      periodEnd: "2026-12-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      supporterSince: "2026-01-15T00:00:00.000Z",
    } as unknown as BillingMeResponseDto);

  const first = renderHook(() => useSupporterStatus(), {
    wrapper: createWrapper(client),
  });

  expect(getMe).not.toHaveBeenCalled();
  expect(first.result.current.queryKey).toEqual(["billing", "me", null]);
  expect(first.result.current.isPending).toBe(true);

  session.id = "user-1";
  first.rerender();

  await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

  expect(getMe).toHaveBeenCalledTimes(1);
  expect(first.result.current.queryKey).toEqual(["billing", "me", "user-1"]);
  expect(first.result.current.data).toEqual({
    isSupporter: true,
    status: "active",
    plan: "supporter",
    billingInterval: "month",
    periodEnd: "2026-12-01T00:00:00.000Z",
    cancelAtPeriodEnd: false,
    supporterSince: "2026-01-15T00:00:00.000Z",
  });

  const query = client
    .getQueryCache()
    .find({ queryKey: ["billing", "me", "user-1"] });
  const options = query?.options as unknown as
    | {
        staleTime?: unknown;
        refetchOnMount?: unknown;
        refetchOnReconnect?: unknown;
      }
    | undefined;
  expect(options?.staleTime).toBe(0);
  expect(options?.refetchOnMount).toBe("always");
  expect(options?.refetchOnReconnect).toBe(true);

  first.unmount();

  const second = renderHook(() => useSupporterStatus(), {
    wrapper: createWrapper(client),
  });

  await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(second.result.current.isSuccess).toBe(true));
});

it("does not infer entitlement or an unknown billing interval", async () => {
  session.id = "user-2";
  const client = createClient();
  vi.spyOn(BillingService, "billingControllerGetMeV1").mockResolvedValue({
    isSupporter: false,
    status: "active",
    plan: "supporter",
    billingInterval: "week",
    periodEnd: null,
    cancelAtPeriodEnd: null,
    supporterSince: null,
  } as unknown as BillingMeResponseDto);

  const hook = renderHook(() => useSupporterStatus(), {
    wrapper: createWrapper(client),
  });

  await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

  expect(hook.result.current.data).toEqual({
    isSupporter: false,
    status: "active",
    plan: "supporter",
    billingInterval: null,
    periodEnd: null,
    cancelAtPeriodEnd: null,
    supporterSince: null,
  });
});

describe("normalizeSupporterStatus supporterSince", () => {
  const raw = (overrides: Record<string, unknown>) =>
    ({
      isSupporter: true,
      status: "active",
      plan: "supporter",
      billingInterval: "month",
      periodEnd: "2026-12-01T00:00:00.000Z",
      cancelAtPeriodEnd: false,
      ...overrides,
    }) as unknown as BillingMeResponseDto;

  it("keeps a server-provided supporterSince string", () => {
    expect(
      normalizeSupporterStatus(
        raw({ supporterSince: "2026-01-15T00:00:00.000Z" }),
      ).supporterSince,
    ).toBe("2026-01-15T00:00:00.000Z");
  });

  it("normalizes an explicit null to null", () => {
    expect(
      normalizeSupporterStatus(raw({ supporterSince: null })).supporterSince,
    ).toBeNull();
  });

  it("normalizes a missing field to null", () => {
    expect(
      normalizeSupporterStatus(raw({ supporterSince: undefined }))
        .supporterSince,
    ).toBeNull();
  });

  it("normalizes non-string values to null instead of guessing", () => {
    expect(
      normalizeSupporterStatus(raw({ supporterSince: 1768000000000 }))
        .supporterSince,
    ).toBeNull();
  });
});
