// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ApiError,
  BillingMeResponseDto,
  BillingPortalResponseDto,
  BillingService,
  BillingSubscriptionActionResponseDto,
  CancelablePromise,
} from "@repo/wrapper/server";
import { UIProvider, type UIHookRegistry } from "@repo/ui";
import { useSupporterActions } from "../../../../../packages/ui/src/components/supporter/hooks/useSupporterActions";

const mocks = vi.hoisted(() => ({
  redirectToAuth: vi.fn(),
  openExternalUrl: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => "user-1" }),
);

vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useRedirectToAuth",
  () => ({ useRedirectToAuth: () => mocks.redirectToAuth }),
);

const PORTAL_URL = "https://billing.stripe.test/portal";

const FREE_STATUS = {
  isSupporter: false,
  status: null,
  plan: null,
  billingInterval: null,
  periodEnd: null,
  cancelAtPeriodEnd: null,
  supporterSince: null,
} as unknown as BillingMeResponseDto;

function pendingPromise<T>() {
  return new Promise<T>(() => {}) as unknown as CancelablePromise<T>;
}

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/billing",
      body: null,
      ok: false,
    },
    "billing error",
  );
}

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <UIProvider
        hooks={
          {
            openExternalUrl: mocks.openExternalUrl,
          } as unknown as UIHookRegistry
        }
      >
        {children}
      </UIProvider>
    </QueryClientProvider>
  );
  Wrapper.displayName = "SupporterActionsWrapper";

  return Wrapper;
}

function renderActions(
  options: Parameters<typeof useSupporterActions>[0] = {},
) {
  return renderHook(() => useSupporterActions(options), {
    wrapper: createWrapper(),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.openExternalUrl.mockResolvedValue(undefined);
  vi.spyOn(BillingService, "billingControllerGetMeV1").mockResolvedValue(
    FREE_STATUS,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useSupporterActions", () => {
  it("opens the portal with the active locale and the returned URL", async () => {
    const portal = vi
      .spyOn(BillingService, "billingControllerCreatePortalV1")
      .mockResolvedValue({ url: PORTAL_URL } as BillingPortalResponseDto);

    const hook = renderActions();

    act(() => hook.result.current.manageBilling());

    await waitFor(() =>
      expect(mocks.openExternalUrl).toHaveBeenCalledWith(PORTAL_URL),
    );
    expect(portal.mock.calls[0][0]).toStrictEqual({ locale: "en" });
    expect(hook.result.current.actionError).toBeNull();
  });

  it.each([
    [404, "supporter.errors.noSubscription"],
    [503, "supporter.errors.billingUnavailable"],
    [500, "supporter.errors.generic"],
  ])("maps a portal %i failure to %s", async (status, expectedKey) => {
    vi.spyOn(
      BillingService,
      "billingControllerCreatePortalV1",
    ).mockRejectedValue(apiError(status));

    const hook = renderActions();
    act(() => hook.result.current.manageBilling());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe(expectedKey),
    );
  });

  it("refreshes the status when the portal reports no subscription", async () => {
    vi.spyOn(
      BillingService,
      "billingControllerCreatePortalV1",
    ).mockRejectedValue(apiError(404));
    const getMe = vi.spyOn(BillingService, "billingControllerGetMeV1");

    const hook = renderActions();
    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(1));

    act(() => hook.result.current.manageBilling());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe(
        "supporter.errors.noSubscription",
      ),
    );
    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));
  });

  it("maps a network portal failure to the network message", async () => {
    vi.spyOn(
      BillingService,
      "billingControllerCreatePortalV1",
    ).mockRejectedValue(new TypeError("Failed to fetch"));

    const hook = renderActions();
    act(() => hook.result.current.manageBilling());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe("supporter.errors.network"),
    );
  });

  it("redirects to sign-in on a 401 portal failure instead of showing an error", async () => {
    vi.spyOn(
      BillingService,
      "billingControllerCreatePortalV1",
    ).mockRejectedValue(apiError(401));

    const hook = renderActions();
    act(() => hook.result.current.manageBilling());

    await waitFor(() => expect(mocks.redirectToAuth).toHaveBeenCalledTimes(1));
    expect(hook.result.current.actionError).toBeNull();
  });

  it.each([
    [409, "supporter.errors.noPendingCancellation"],
    [503, "supporter.errors.billingUnavailable"],
    [500, "supporter.errors.generic"],
  ])("maps a restore %i failure to %s", async (status, expectedKey) => {
    vi.spyOn(BillingService, "billingControllerRestoreV1").mockRejectedValue(
      apiError(status),
    );

    const hook = renderActions();
    act(() => hook.result.current.restoreSubscription());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe(expectedKey),
    );
    expect(hook.result.current.cancelError).toBeNull();
  });

  it("maps a restore network failure and a 404 that refreshes the status", async () => {
    const getMe = vi.spyOn(BillingService, "billingControllerGetMeV1");
    const restore = vi.spyOn(BillingService, "billingControllerRestoreV1");
    restore.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const hook = renderActions();
    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(1));

    act(() => hook.result.current.restoreSubscription());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe("supporter.errors.network"),
    );

    restore.mockRejectedValueOnce(apiError(404));
    act(() => hook.result.current.restoreSubscription());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe(
        "supporter.errors.noSubscription",
      ),
    );
    await waitFor(() => expect(getMe).toHaveBeenCalledTimes(2));
  });

  it.each([
    [404, "supporter.errors.noSubscription"],
    [503, "supporter.errors.billingUnavailable"],
    [500, "supporter.errors.generic"],
  ])(
    "maps a cancel %i failure into the dialog error",
    async (status, expectedKey) => {
      vi.spyOn(BillingService, "billingControllerCancelV1").mockRejectedValue(
        apiError(status),
      );

      const hook = renderActions();
      act(() => hook.result.current.cancelSubscription());

      await waitFor(() =>
        expect(hook.result.current.cancelError).toBe(expectedKey),
      );
      expect(hook.result.current.actionError).toBeNull();
    },
  );

  it("maps a cancel network failure and redirects on a lost session", async () => {
    const cancel = vi.spyOn(BillingService, "billingControllerCancelV1");
    cancel.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const hook = renderActions();
    act(() => hook.result.current.cancelSubscription());

    await waitFor(() =>
      expect(hook.result.current.cancelError).toBe("supporter.errors.network"),
    );

    cancel.mockRejectedValueOnce(apiError(401));
    act(() => hook.result.current.cancelSubscription());

    await waitFor(() => expect(mocks.redirectToAuth).toHaveBeenCalledTimes(1));
    expect(hook.result.current.cancelError).toBeNull();
  });

  it("calls onCancelSuccess after a confirmed cancellation", async () => {
    vi.spyOn(BillingService, "billingControllerCancelV1").mockResolvedValue({
      status: "active",
      cancelAtPeriodEnd: true,
      periodEnd: null,
    } as unknown as BillingSubscriptionActionResponseDto);
    const onCancelSuccess = vi.fn();

    const hook = renderActions({ onCancelSuccess });
    act(() => hook.result.current.cancelSubscription());

    await waitFor(() => expect(onCancelSuccess).toHaveBeenCalledTimes(1));
  });

  it("clears a previous action error before the next attempt", async () => {
    const portal = vi.spyOn(BillingService, "billingControllerCreatePortalV1");
    portal.mockRejectedValueOnce(apiError(503));

    const hook = renderActions();
    act(() => hook.result.current.manageBilling());

    await waitFor(() =>
      expect(hook.result.current.actionError).toBe(
        "supporter.errors.billingUnavailable",
      ),
    );

    portal.mockResolvedValueOnce({
      url: PORTAL_URL,
    } as BillingPortalResponseDto);
    act(() => hook.result.current.manageBilling());

    await waitFor(() => expect(hook.result.current.actionError).toBeNull());
  });

  it("exposes each pending state and disables any action while one runs", async () => {
    vi.spyOn(BillingService, "billingControllerCreatePortalV1").mockReturnValue(
      pendingPromise<BillingPortalResponseDto>(),
    );

    const hook = renderActions();

    expect(hook.result.current.isAnyPending).toBe(false);

    act(() => hook.result.current.manageBilling());

    await waitFor(() => expect(hook.result.current.isPortalPending).toBe(true));
    expect(hook.result.current.isAnyPending).toBe(true);
    expect(hook.result.current.isCancelPending).toBe(false);
    expect(hook.result.current.isRestorePending).toBe(false);
  });

  it("exposes the restore pending state", async () => {
    vi.spyOn(BillingService, "billingControllerRestoreV1").mockReturnValue(
      pendingPromise<BillingSubscriptionActionResponseDto>(),
    );

    const hook = renderActions();
    act(() => hook.result.current.restoreSubscription());

    await waitFor(() =>
      expect(hook.result.current.isRestorePending).toBe(true),
    );
    expect(hook.result.current.isAnyPending).toBe(true);
  });

  it("exposes the cancel pending state", async () => {
    vi.spyOn(BillingService, "billingControllerCancelV1").mockReturnValue(
      pendingPromise<BillingSubscriptionActionResponseDto>(),
    );

    const hook = renderActions();
    act(() => hook.result.current.cancelSubscription());

    await waitFor(() => expect(hook.result.current.isCancelPending).toBe(true));
    expect(hook.result.current.isAnyPending).toBe(true);
  });
});
