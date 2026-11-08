// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIProvider, type UIHookRegistry } from "@repo/ui";
import { SupporterSubscriptionCard } from "../../../../../packages/ui/src/components/supporter/settings/SupporterSubscriptionCard";
import type { SupporterStatus } from "../../../../../packages/ui/src/components/supporter/types";

const mocks = vi.hoisted(() => ({
  actionError: null as string | null,
  cancelError: null as string | null,
  isPortalPending: false,
  isCancelPending: false,
  isRestorePending: false,
  isAnyPending: false,
  manageBilling: vi.fn(),
  restoreSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  clearCancelError: vi.fn(),
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

vi.mock(
  "../../../../../packages/ui/src/components/supporter/hooks/useSupporterActions",
  () => ({
    useSupporterActions: () => ({
      portal: { isPending: mocks.isPortalPending },
      cancel: { isPending: mocks.isCancelPending },
      restore: { isPending: mocks.isRestorePending },
      actionError: mocks.actionError,
      cancelError: mocks.cancelError,
      clearActionError: vi.fn(),
      clearCancelError: mocks.clearCancelError,
      manageBilling: mocks.manageBilling,
      restoreSubscription: mocks.restoreSubscription,
      cancelSubscription: mocks.cancelSubscription,
      isPortalPending: mocks.isPortalPending,
      isCancelPending: mocks.isCancelPending,
      isRestorePending: mocks.isRestorePending,
      isAnyPending: mocks.isAnyPending,
    }),
  }),
);

const ACTIVE_STATUS: SupporterStatus = {
  isSupporter: true,
  status: "active",
  plan: "supporter",
  billingInterval: "year",
  periodEnd: "2027-03-03T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  supporterSince: "2026-01-15T00:00:00.000Z",
};

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
    <div role={"dialog"} aria-label={title}>
      {children}
    </div>
  ) : null;

function renderCard(status: SupporterStatus) {
  const ui: ReactElement = (
    <MantineProvider>
      <UIProvider
        presenters={{ Modal: MockModal }}
        hooks={{} as unknown as UIHookRegistry}
      >
        <SupporterSubscriptionCard status={status} />
      </UIProvider>
    </MantineProvider>
  );

  return render(ui);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.actionError = null;
  mocks.cancelError = null;
  mocks.isPortalPending = false;
  mocks.isCancelPending = false;
  mocks.isRestorePending = false;
  mocks.isAnyPending = false;
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
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SupporterSubscriptionCard", () => {
  it("renders nothing without a subscription", () => {
    const { container } = renderCard({
      isSupporter: false,
      status: "canceled",
      plan: "supporter",
      billingInterval: null,
      periodEnd: null,
      cancelAtPeriodEnd: false,
      supporterSince: null,
    });

    expect(container.querySelector("[data-testid]")).toBeNull();
  });

  it("shows the plan, renewal date and billing actions for an active subscription", () => {
    renderCard(ACTIVE_STATUS);

    const card = screen.getByTestId("supporter-subscription-card");

    expect(card.textContent).toContain("supporter.subscription.plan");
    expect(card.textContent).toContain("supporter.planName");
    expect(card.textContent).toContain("supporter.billing.yearly");
    expect(card.textContent).toContain("supporter.billing.renewsOn");
    expect(screen.getByText("supporter.status.active")).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.actions.manageBilling" }),
    );
    expect(mocks.manageBilling).toHaveBeenCalledTimes(1);

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

    expect(mocks.cancelSubscription).toHaveBeenCalledTimes(1);
  });

  it("offers keep subscription instead of cancel while cancellation is pending", () => {
    renderCard({ ...ACTIVE_STATUS, cancelAtPeriodEnd: true });

    const card = screen.getByTestId("supporter-subscription-card");

    expect(card.textContent).toContain("supporter.pendingCancellation.title");
    expect(card.textContent).toContain("supporter.billing.endsOn");
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

    expect(mocks.restoreSubscription).toHaveBeenCalledTimes(1);
  });

  it("asks for an updated payment method on past due and never offers cancel", () => {
    renderCard({ ...ACTIVE_STATUS, status: "past_due" });

    expect(screen.getByText("supporter.status.past_due")).toBeTruthy();
    expect(
      screen.getByText("supporter.subscription.paymentIssue"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.pastDue.action" }),
    );

    expect(mocks.manageBilling).toHaveBeenCalledTimes(1);
  });

  it("shows only the end date for a canceled but paid subscription", () => {
    renderCard({ ...ACTIVE_STATUS, status: "canceled" });

    const card = screen.getByTestId("supporter-subscription-card");

    expect(card.textContent).toContain("supporter.subscription.ends");
    expect(card.textContent).toContain("supporter.billing.endsOn");
    expect(
      screen.queryByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "supporter.actions.keepSubscription",
      }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "supporter.actions.manageBilling" }),
    ).toBeTruthy();
  });

  it("disables every action while a mutation is pending", () => {
    mocks.isAnyPending = true;
    mocks.isPortalPending = true;

    renderCard(ACTIVE_STATUS);

    expect(
      (
        screen.getByRole("button", {
          name: "supporter.actions.manageBilling",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    expect(
      (
        screen.getByRole("button", {
          name: "supporter.actions.cancelSubscription",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("shows the mapped action error above the card", () => {
    mocks.actionError = "supporter.errors.billingUnavailable";

    renderCard(ACTIVE_STATUS);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("supporter.errors.billingUnavailable"),
    ).toBeTruthy();
  });

  it("passes the cancellation error to the dialog", () => {
    mocks.cancelError = "supporter.errors.network";

    renderCard(ACTIVE_STATUS);

    fireEvent.click(
      screen.getByRole("button", {
        name: "supporter.actions.cancelSubscription",
      }),
    );

    expect(screen.getByText("supporter.errors.network")).toBeTruthy();
    expect(mocks.clearCancelError).toHaveBeenCalledTimes(1);
  });
});
