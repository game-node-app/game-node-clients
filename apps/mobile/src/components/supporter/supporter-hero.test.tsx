// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupporterHeroCard } from "../../../../../packages/ui/src/components/supporter/settings/SupporterHeroCard";
import type {
  SupporterOffers,
  SupporterStatus,
} from "../../../../../packages/ui/src/components/supporter/types";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

const BRL_OFFERS: SupporterOffers = {
  currency: "BRL",
  offers: [
    {
      plan: "supporter",
      interval: "monthly",
      amount: 1990,
      displayAmount: "R$ 19,90",
    },
    {
      plan: "supporter",
      interval: "yearly",
      amount: 19900,
      displayAmount: "R$ 199,00",
    },
  ],
};

const USD_OFFERS: SupporterOffers = {
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
  periodEnd: "2027-03-03T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  supporterSince: "2026-01-15T00:00:00.000Z",
};

function renderHero(
  overrides: Partial<ComponentProps<typeof SupporterHeroCard>> = {},
) {
  return render(
    <MantineProvider>
      <SupporterHeroCard
        status={FREE_STATUS}
        offers={BRL_OFFERS}
        selectedInterval={"monthly"}
        onIntervalChange={vi.fn()}
        onSubscribe={vi.fn()}
        {...overrides}
      />
    </MantineProvider>,
  );
}

function renderWithMantine(ui: ReactElement) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

beforeEach(() => {
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
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("SupporterHeroCard", () => {
  it("shows BRL prices from displayAmount and selects the yearly plan", () => {
    const onIntervalChange = vi.fn();
    renderHero({ onIntervalChange });

    const monthly = screen.getByTestId("supporter-plan-option-monthly");
    const yearly = screen.getByTestId("supporter-plan-option-yearly");

    expect(monthly.getAttribute("aria-pressed")).toBe("true");
    expect(yearly.getAttribute("aria-pressed")).toBe("false");
    expect(monthly.textContent).toContain("R$ 19,90");
    expect(yearly.textContent).toContain("R$ 199,00");

    fireEvent.click(yearly);

    expect(onIntervalChange).toHaveBeenCalledWith("yearly");
  });

  it("shows USD prices without computing or converting them", () => {
    renderHero({ offers: USD_OFFERS });

    expect(
      screen.getByTestId("supporter-plan-option-monthly").textContent,
    ).toContain("$5.00");
    expect(
      screen.getByTestId("supporter-plan-option-yearly").textContent,
    ).toContain("$50.00");
    expect(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    ).toBeTruthy();
  });

  it("renders price skeletons and disables subscribe while offers load", () => {
    renderHero({ offers: undefined, isOffersLoading: true });

    expect(
      screen.getByTestId("supporter-plan-price-loading-monthly"),
    ).toBeTruthy();
    expect(
      screen.getByTestId("supporter-plan-price-loading-yearly"),
    ).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "supporter.plans.monthlyCta",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("shows the hero skeleton while the status is loading", () => {
    renderHero({ status: undefined, isStatusLoading: true });

    expect(screen.getByTestId("supporter-hero-loading")).toBeTruthy();
    expect(screen.queryByTestId("supporter-plan-option-monthly")).toBeNull();
  });

  it("shows pricing unavailable with retry when offers fail", () => {
    const onRetryOffers = vi.fn();
    renderHero({ offers: undefined, isOffersError: true, onRetryOffers });

    expect(screen.getByText("supporter.plans.priceUnavailable")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: "supporter.plans.monthlyCta",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.retry" }),
    );

    expect(onRetryOffers).toHaveBeenCalledTimes(1);
  });

  it("shows the temporarily unavailable copy and no subscribe action on 503", () => {
    renderHero({ status: undefined, statusErrorKind: "unavailable" });

    expect(
      screen.getByText("supporter.errors.billingUnavailable"),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "supporter.plans.monthlyCta",
      }),
    ).toBeNull();
    expect(screen.queryByTestId("supporter-plan-option-monthly")).toBeNull();
  });

  it("offers retry for a non-503 status failure", () => {
    const onRetryStatus = vi.fn();
    renderHero({
      status: undefined,
      statusErrorKind: "network",
      onRetryStatus,
    });

    expect(screen.getByText("supporter.errors.network")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "supporter.actions.retry" }),
    );

    expect(onRetryStatus).toHaveBeenCalledTimes(1);
  });

  it("shows the active status and a summary line for supporters", () => {
    renderHero({ status: ACTIVE_STATUS });

    const card = screen.getByTestId("supporter-hero-card");

    expect(screen.getByText("supporter.status.active")).toBeTruthy();
    expect(card.textContent).toContain("supporter.subscription.thankYou");
    expect(card.textContent).toContain("supporter.planName");
    expect(card.textContent).toContain("supporter.billing.monthly");
    expect(card.textContent).toContain("supporter.billing.renewsOn");
    expect(
      screen.queryByRole("button", {
        name: "supporter.plans.monthlyCta",
      }),
    ).toBeNull();
    expect(screen.queryByTestId("supporter-plan-option-monthly")).toBeNull();
  });

  it("shows the trial status for a trialing subscription", () => {
    renderHero({ status: { ...ACTIVE_STATUS, status: "trialing" } });

    expect(screen.getByText("supporter.status.trialing")).toBeTruthy();
  });

  it("shows the payment issue pill for a past due subscription", () => {
    renderHero({ status: { ...ACTIVE_STATUS, status: "past_due" } });

    expect(screen.getByText("supporter.status.past_due")).toBeTruthy();
  });

  it("shows the end date pill while cancellation is pending", () => {
    renderHero({ status: { ...ACTIVE_STATUS, cancelAtPeriodEnd: true } });

    expect(screen.getByText("supporter.subscription.endingOn")).toBeTruthy();
    expect(screen.queryByText("supporter.status.active")).toBeNull();
  });

  it("subscribes with the selected interval", () => {
    const onSubscribe = vi.fn();
    const { rerender } = renderHero({ onSubscribe });

    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.monthlyCta" }),
    );
    expect(onSubscribe).toHaveBeenCalledWith("monthly");

    rerender(
      <MantineProvider>
        <SupporterHeroCard
          status={FREE_STATUS}
          offers={BRL_OFFERS}
          selectedInterval={"yearly"}
          onIntervalChange={vi.fn()}
          onSubscribe={onSubscribe}
        />
      </MantineProvider>,
    );

    expect(
      screen
        .getByTestId("supporter-plan-option-yearly")
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(
      screen.getByRole("button", { name: "supporter.plans.yearlyCta" }),
    );
    expect(onSubscribe).toHaveBeenCalledWith("yearly");
  });

  it("renders static markup through the Mantine provider", () => {
    renderWithMantine(
      <SupporterHeroCard
        status={FREE_STATUS}
        offers={BRL_OFFERS}
        selectedInterval={"monthly"}
        onIntervalChange={vi.fn()}
        onSubscribe={vi.fn()}
      />,
    );

    expect(screen.getByTestId("supporter-hero-card")).toBeTruthy();
  });
});
