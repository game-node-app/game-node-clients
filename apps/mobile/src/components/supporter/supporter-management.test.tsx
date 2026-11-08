// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BillingPortalResponseDto,
  BillingService,
  BillingSubscriptionActionResponseDto,
} from "@repo/wrapper/server";
import { useSupporterManagement } from "../../../../../packages/ui/src/components/supporter/hooks/useSupporterManagement";
import {
  getSupporterStatusQueryKey,
  SUPPORTER_QUERY_KEYS,
} from "../../../../../packages/ui/src/components/supporter/hooks/supporterQueryKeys";
import type { SupporterStatus } from "../../../../../packages/ui/src/components/supporter/types";

const session = vi.hoisted(() => ({ id: "user-1" as string | undefined }));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => session.id }),
);

const ACTIVE_STATUS: SupporterStatus = {
  isSupporter: true,
  status: "active",
  plan: "supporter",
  billingInterval: "month",
  periodEnd: "2026-11-15T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  supporterSince: "2026-01-15T00:00:00.000Z",
};

function createWrapper(client: QueryClient) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "SupporterManagementQueryClientWrapper";
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
  session.id = "user-1";
});

it("merges the authoritative cancel response into the cached status and invalidates the prefix", async () => {
  const client = createClient();
  client.setQueryData(getSupporterStatusQueryKey("user-1"), ACTIVE_STATUS);
  const invalidate = vi.spyOn(client, "invalidateQueries");

  vi.spyOn(BillingService, "billingControllerCancelV1").mockResolvedValue({
    status: "active",
    cancelAtPeriodEnd: true,
    periodEnd: "2026-12-15T00:00:00.000Z",
  } as unknown as BillingSubscriptionActionResponseDto);

  const hook = renderHook(() => useSupporterManagement(), {
    wrapper: createWrapper(client),
  });

  await act(async () => {
    await hook.result.current.cancel.mutateAsync();
  });

  expect(client.getQueryData(getSupporterStatusQueryKey("user-1"))).toEqual({
    ...ACTIVE_STATUS,
    status: "active",
    cancelAtPeriodEnd: true,
    periodEnd: "2026-12-15T00:00:00.000Z",
  });
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: SUPPORTER_QUERY_KEYS.me,
    refetchType: "none",
  });
});

it("merges the authoritative restore response into the cached status and invalidates the prefix", async () => {
  const client = createClient();
  client.setQueryData(getSupporterStatusQueryKey("user-1"), {
    ...ACTIVE_STATUS,
    cancelAtPeriodEnd: true,
  });
  const invalidate = vi.spyOn(client, "invalidateQueries");

  vi.spyOn(BillingService, "billingControllerRestoreV1").mockResolvedValue({
    status: "active",
    cancelAtPeriodEnd: false,
    periodEnd: "2027-01-15T00:00:00.000Z",
  } as unknown as BillingSubscriptionActionResponseDto);

  const hook = renderHook(() => useSupporterManagement(), {
    wrapper: createWrapper(client),
  });

  await act(async () => {
    await hook.result.current.restore.mutateAsync();
  });

  expect(client.getQueryData(getSupporterStatusQueryKey("user-1"))).toEqual({
    ...ACTIVE_STATUS,
    cancelAtPeriodEnd: false,
    periodEnd: "2027-01-15T00:00:00.000Z",
  });
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: SUPPORTER_QUERY_KEYS.me,
    refetchType: "none",
  });
});

it("never invents entitlement when there is no cached status row", async () => {
  const client = createClient();
  const invalidate = vi.spyOn(client, "invalidateQueries");

  vi.spyOn(BillingService, "billingControllerCancelV1").mockResolvedValue({
    status: "canceled",
    cancelAtPeriodEnd: false,
    periodEnd: "2026-12-15T00:00:00.000Z",
  } as unknown as BillingSubscriptionActionResponseDto);

  const hook = renderHook(() => useSupporterManagement(), {
    wrapper: createWrapper(client),
  });

  await act(async () => {
    await hook.result.current.cancel.mutateAsync();
  });

  expect(
    client.getQueryData(getSupporterStatusQueryKey("user-1")),
  ).toBeUndefined();
  expect(invalidate).toHaveBeenCalledWith({
    queryKey: SUPPORTER_QUERY_KEYS.me,
    refetchType: "none",
  });
});

it("opens the portal with only the optional locale and does not mutate status", async () => {
  const client = createClient();
  client.setQueryData(getSupporterStatusQueryKey("user-1"), ACTIVE_STATUS);
  const portal = vi
    .spyOn(BillingService, "billingControllerCreatePortalV1")
    .mockResolvedValue({
      url: "https://billing.stripe.com/portal",
    } as unknown as BillingPortalResponseDto);

  const hook = renderHook(() => useSupporterManagement(), {
    wrapper: createWrapper(client),
  });

  const result = await hook.result.current.portal.mutateAsync({
    locale: "pt-BR",
  });

  expect(result).toEqual({ url: "https://billing.stripe.com/portal" });
  expect(portal.mock.calls[0][0]).toStrictEqual({ locale: "pt-BR" });

  await hook.result.current.portal.mutateAsync({});

  expect(portal.mock.calls[1][0]).toStrictEqual({});
  expect(client.getQueryData(getSupporterStatusQueryKey("user-1"))).toEqual(
    ACTIVE_STATUS,
  );
});
