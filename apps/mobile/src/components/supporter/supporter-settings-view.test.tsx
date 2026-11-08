// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { ApiError } from "@repo/wrapper/server";
import {
  DEFAULT_MANTINE_THEME,
  UIProvider,
  type UIHookRegistry,
} from "@repo/ui";
import { SupporterSettingsView } from "../../../../../packages/ui/src/components/supporter/settings/SupporterSettingsView";
import type {
  SupporterOffers,
  SupporterStatus,
} from "../../../../../packages/ui/src/components/supporter/types";

const mocks = vi.hoisted(() => ({
  userId: "user-1" as string | undefined,
  openExternalUrl: vi.fn(),
  redirectToAuth: vi.fn(),
  status: {
    data: undefined as SupporterStatus | undefined,
    error: null as unknown,
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
    invalidate: vi.fn(),
  },
  offers: {
    data: undefined as SupporterOffers | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
  checkout: {
    mutate: vi.fn(),
    isPending: false,
  },
  actions: {
    actionError: null as string | null,
    cancelError: null as string | null,
    isPortalPending: false,
    isCancelPending: false,
    isRestorePending: false,
    isAnyPending: false,
    manageBilling: vi.fn(),
    restoreSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    clearActionError: vi.fn(),
    clearCancelError: vi.fn(),
    cancelOptions: undefined as { onCancelSuccess?: () => void } | undefined,
  },
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterStatus",
  () => ({ useSupporterStatus: () => mocks.status }),
);
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterOffers",
  () => ({ useSupporterOffers: () => mocks.offers }),
);
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterCheckout",
  () => ({ useSupporterCheckout: () => mocks.checkout }),
);
vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterActions",
  () => ({
    useSupporterActions: (options?: { onCancelSuccess?: () => void }) => {
      mocks.actions.cancelOptions = options;

      return {
        portal: { isPending: mocks.actions.isPortalPending },
        cancel: { isPending: mocks.actions.isCancelPending },
        restore: { isPending: mocks.actions.isRestorePending },
        actionError: mocks.actions.actionError,
        cancelError: mocks.actions.cancelError,
        clearActionError: mocks.actions.clearActionError,
        clearCancelError: mocks.actions.clearCancelError,
        manageBilling: () => mocks.actions.manageBilling(),
        restoreSubscription: () => mocks.actions.restoreSubscription(),
        cancelSubscription: () => {
          mocks.actions.cancelSubscription();
          mocks.actions.cancelOptions?.onCancelSuccess?.();
        },
        isPortalPending: mocks.actions.isPortalPending,
        isCancelPending: mocks.actions.isCancelPending,
        isRestorePending: mocks.actions.isRestorePending,
        isAnyPending: mocks.actions.isAnyPending,
      };
    },
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useUserId",
  () => ({ useUserId: () => mocks.userId }),
);
vi.mock(
  "../../../../../packages/ui/src/components/auth/hooks/useRedirectToAuth",
  () => ({ useRedirectToAuth: () => mocks.redirectToAuth }),
);

// The feature catalog renders the real profile preview; keep it on the same
// public data the profile page uses without a network layer.
vi.mock(
  "../../../../../packages/ui/src/components/profile/hooks/useUserProfile",
  () => ({
    useUserProfile: () => ({
      data: { username: "cassio", banner: null, avatar: null },
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/follow/hooks/useInfiniteFollowInfo",
  () => ({
    useInfiniteFollowInfo: () => ({
      data: { pages: [{ pagination: { totalItems: 3 } }] },
    }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId",
  () => ({
    useFavoriteCollectionEntriesForUserId: () => ({ data: { data: [] } }),
  }),
);
vi.mock(
  "../../../../../packages/ui/src/components/game/hooks/useGames",
  () => ({ useGames: () => ({ data: [] }) }),
);

const OFFERS: SupporterOffers = {
  currency: "USD",
  offers: [
    {
      plan: "supporter",
      interval: "monthly",
      amount: 500,
      displayAmount: "$5.00",
    },
    {
      plan: "supporter",
      interval: "yearly",
      amount: 5000,
      displayAmount: "$50.00",
    },
  ],
};

const FREE_STATUS: SupporterStatus = {
  isSupporter: false,
  status: null,
  plan: null,
  billingInterval: null,
  periodEnd: null,
  cancelAtPeriodEnd: null,
  supporterSince: null,
};

const ACTIVE_STATUS: SupporterStatus = {
  isSupporter: true,
  status: "active",
  plan: "supporter",
  billingInterval: "month",
  periodEnd: "2026-12-15T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  supporterSince: "2026-01-15T00:00:00.000Z",
};

const CHECKOUT_URL = "https://checkout.stripe.test/session";

type MutationCallbacks = {
  onSuccess?: (data: { url: string }) => void;
  onError?: (error: unknown) => void;
};

function apiError(status: number) {
  return new ApiError(
    {} as unknown as ConstructorParameters<typeof ApiError>[0],
    {
      status,
      statusText: "",
      url: "/v1/billing/me",
      body: null,
      ok: false,
    },
    "billing error",
  );
}

const MockLink = ({ children, ...props }: React.ComponentProps<"a">) => (
  <a {...props}>{children}</a>
);

const MockModal = ({
  opened,
  title,
  children,
}: {
  opened?: boolean;
  title?: string;
  children?: React.ReactNode;
}) =>
  opened ? (
    <div role="dialog" aria-label={title}>
      {children}
    </div>
  ) : null;

function renderView(
  props: Partial<React.ComponentProps<typeof SupporterSettingsView>> = {},
) {
  return render(
    <MantineProvider theme={DEFAULT_MANTINE_THEME}>
      <UIProvider
        presenters={{ Link: MockLink, Modal: MockModal }}
        hooks={
          {
            openExternalUrl: mocks.openExternalUrl,
          } as unknown as UIHookRegistry
        }
      >
        <SupporterSettingsView {...props} />
      </UIProvider>
    </MantineProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );

  mocks.userId = "user-1";
  mocks.status.data = undefined;
  mocks.status.error = null;
  mocks.status.isError = false;
  mocks.status.isLoading = false;
  mocks.status.isFetching = false;
  mocks.status.refetch.mockImplementation(() => {});
  mocks.offers.data = OFFERS;
  mocks.offers.isLoading = false;
  mocks.offers.isError = false;
  mocks.offers.refetch.mockImplementation(() => {});
  mocks.checkout.isPending = false;
  mocks.checkout.mutate.mockImplementation(() => {});

  mocks.actions.actionError = null;
  mocks.actions.cancelError = null;
  mocks.actions.isPortalPending = false;
  mocks.actions.isCancelPending = false;
  mocks.actions.isRestorePending = false;
  mocks.actions.isAnyPending = false;
  mocks.actions.cancelOptions = undefined;

  mocks.openExternalUrl.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("SupporterSettingsView", () => {
  it("shows the free state together with the plans", () => {
    mocks.status.data = FREE_STATUS;

    renderView();

    expect(screen.getByText("supporter.status.free")).toBeTruthy();
    expect(screen.getByTestId("supporter-plan-option-monthly")).toBeTruthy();
    expect(screen.getByTestId("supporter-plan-option-yearly")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    ).toBeTruthy();
  });

  it("shows renewal details and exposes manage and cancel for an active subscription", async () => {
    mocks.status.data = ACTIVE_STATUS;

    renderView();

    const subscriptionCard = screen.getByTestId("supporter-subscription-card");

    expect(subscriptionCard.textContent).toContain(
      "supporter.subscription.plan",
    );
    expect(subscriptionCard.textContent).toContain("supporter.planName");
    expect(subscriptionCard.textContent).toContain("supporter.billing.monthly");
    expect(subscriptionCard.textContent).toContain(
      "supporter.billing.renewsOn",
    );
    expect(subscriptionCard.textContent).toContain("supporter.status.active");
    expect(screen.queryByTestId("supporter-plan-option-monthly")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.actions.manageBilling" }),
    );

    expect(mocks.actions.manageBilling).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    );

    expect(
      screen.getByRole("dialog", { name: "supporter.cancelDialog.title" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.cancelDialog.confirm" }),
    );

    expect(mocks.actions.cancelSubscription).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("treats a trialing subscription as an active one", () => {
    mocks.status.data = { ...ACTIVE_STATUS, status: "trialing" };

    renderView();

    const subscriptionCard = screen.getByTestId("supporter-subscription-card");

    expect(subscriptionCard.textContent).toContain("supporter.status.trialing");
    expect(subscriptionCard.textContent).toContain(
      "supporter.billing.renewsOn",
    );
  });

  it("asks for a payment method on past_due and never offers cancel", () => {
    mocks.status.data = { ...ACTIVE_STATUS, status: "past_due" };

    renderView();

    expect(
      screen.getByText("supporter.subscription.paymentIssue"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "supporter.pastDue.action" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.pastDue.action" }),
    );

    expect(mocks.actions.manageBilling).toHaveBeenCalledTimes(1);
  });

  it("offers restore instead of cancel while cancellation is pending", () => {
    mocks.status.data = { ...ACTIVE_STATUS, cancelAtPeriodEnd: true };

    renderView();

    expect(
      screen.getByText("supporter.pendingCancellation.title"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: "supporter.actions.keepSubscription",
      }),
    );

    expect(mocks.actions.restoreSubscription).toHaveBeenCalledTimes(1);
  });

  it("keeps checkout success unconfirmed and polls until it times out", () => {
    vi.useFakeTimers();
    mocks.status.data = FREE_STATUS;

    renderView({ checkout: "success" });

    expect(screen.getByText("supporter.checkout.pending.title")).toBeTruthy();
    expect(
      screen.getByText("supporter.checkout.pending.description"),
    ).toBeTruthy();
    expect(mocks.status.refetch).not.toHaveBeenCalled();
    expect(
      screen.queryByText("supporter.checkout.pending.stillConfirming"),
    ).toBeNull();

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(mocks.status.refetch).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(
      screen.getByText("supporter.checkout.pending.stillConfirming"),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "supporter.checkout.pending.refresh",
      }),
    ).toBeTruthy();
  });

  it("confirms the subscription once the server reports the supporter", () => {
    mocks.status.data = ACTIVE_STATUS;

    renderView({ checkout: "success" });

    expect(screen.getByText("supporter.checkout.success.title")).toBeTruthy();
    expect(screen.queryByText("supporter.checkout.pending.title")).toBeNull();
    expect(
      screen.getByTestId("supporter-settings-banner-success"),
    ).toBeTruthy();
  });

  it("shows a neutral alert when checkout was cancelled", () => {
    mocks.status.data = FREE_STATUS;

    renderView({ checkout: "cancel" });

    expect(screen.getByText("supporter.checkout.cancel.title")).toBeTruthy();
    expect(
      screen.getByText("supporter.checkout.cancel.description"),
    ).toBeTruthy();
    expect(screen.queryByText("supporter.checkout.success.title")).toBeNull();
  });

  it("blocks checkout and shows billing unavailable when status returns 503", () => {
    mocks.status.error = apiError(503);
    mocks.status.isError = true;

    renderView();

    expect(
      screen.getByText("supporter.errors.billingUnavailable"),
    ).toBeTruthy();
    expect(screen.queryByTestId("supporter-plan-option-monthly")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "supporter.plans.monthlyCta" }),
    ).toBeNull();
    expect(screen.getByTestId("supporter-feature-catalog")).toBeTruthy();
    expect(screen.getByTestId("supporter-always-free-card")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.actions.retry" }),
    );

    expect(mocks.status.refetch).toHaveBeenCalled();
  });

  it("surfaces an existing subscription when checkout conflicts", () => {
    mocks.status.data = FREE_STATUS;
    mocks.checkout.mutate.mockImplementation(
      (_variables: unknown, callbacks?: MutationCallbacks) => {
        callbacks?.onError?.(apiError(409));
      },
    );

    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    );

    expect(
      screen.getByText("supporter.errors.existingSubscription"),
    ).toBeTruthy();
    expect(mocks.status.invalidate).toHaveBeenCalled();
  });

  it("maps a network checkout failure to an inline banner", () => {
    mocks.status.data = FREE_STATUS;
    mocks.checkout.mutate.mockImplementation(
      (_variables: unknown, callbacks?: MutationCallbacks) => {
        callbacks?.onError?.(new TypeError("fetch failed"));
      },
    );

    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("supporter.errors.network")).toBeTruthy();
  });

  it("sends an unauthorized checkout failure to sign-in instead of a banner", () => {
    mocks.status.data = FREE_STATUS;
    mocks.checkout.mutate.mockImplementation(
      (_variables: unknown, callbacks?: MutationCallbacks) => {
        callbacks?.onError?.(apiError(401));
      },
    );

    renderView();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    );

    expect(mocks.redirectToAuth).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("redirects signed-out users to auth instead of starting checkout", () => {
    mocks.userId = undefined;
    mocks.status.data = undefined;

    renderView();

    expect(screen.getByTestId("supporter-plan-option-monthly")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    );

    expect(mocks.redirectToAuth).toHaveBeenCalledTimes(1);
    expect(mocks.checkout.mutate).not.toHaveBeenCalled();
  });

  it("seeds the interval from the route and starts checkout with it", async () => {
    mocks.status.data = FREE_STATUS;
    mocks.checkout.mutate.mockImplementation(
      (_variables: unknown, callbacks?: MutationCallbacks) => {
        callbacks?.onSuccess?.({ url: CHECKOUT_URL });
      },
    );
    const onCheckoutStarted = vi.fn();

    renderView({ interval: "yearly", onCheckoutStarted });

    expect(
      screen
        .getByTestId("supporter-plan-option-yearly")
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen.getByTestId("supporter-plan-option-yearly").textContent,
    ).toContain("$50.00");

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.yearlyCta" }),
    );

    expect(mocks.checkout.mutate).toHaveBeenCalledWith(
      { interval: "yearly", locale: "en" },
      expect.anything(),
    );
    expect(onCheckoutStarted).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(mocks.openExternalUrl).toHaveBeenCalledWith(CHECKOUT_URL),
    );
  });

  it("updates the selected plan when another option is picked", () => {
    mocks.status.data = FREE_STATUS;

    renderView();

    const yearly = screen.getByTestId("supporter-plan-option-yearly");

    expect(yearly.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(yearly);

    expect(yearly.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "supporter.plans.yearlyCta" }),
    ).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.yearlyCta" }),
    );

    expect(mocks.checkout.mutate).toHaveBeenCalledWith(
      { interval: "yearly", locale: "en" },
      expect.anything(),
    );
  });

  it("shows pricing unavailable and retries when offers fail", () => {
    mocks.status.data = FREE_STATUS;
    mocks.offers.data = undefined;
    mocks.offers.isError = true;

    renderView();

    expect(screen.getByText("supporter.plans.priceUnavailable")).toBeTruthy();
    expect(screen.queryByText("$5.00")).toBeNull();
    expect(screen.queryByText("USD")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.retry" }),
    );

    expect(mocks.offers.refetch).toHaveBeenCalledTimes(1);
  });

  it("renders the feature catalog and the always-free card for free users", () => {
    mocks.status.data = FREE_STATUS;

    renderView();

    expect(screen.getByTestId("supporter-feature-catalog")).toBeTruthy();
    expect(screen.getByTestId("supporter-always-free-card")).toBeTruthy();
    expect(screen.getByText("supporter.features.descriptionFree")).toBeTruthy();
    expect(screen.getByText(/settings\.premium\.billingHelp/)).toBeTruthy();
  });
});
