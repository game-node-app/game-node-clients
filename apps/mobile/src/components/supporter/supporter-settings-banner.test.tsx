// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SupporterSettingsBanner } from "../../../../../packages/ui/src/components/supporter/settings/SupporterSettingsBanner";

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useI18nContext: () => ({ language: "en" }),
}));

function renderBanner(ui: ReactElement) {
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("SupporterSettingsBanner", () => {
  it("renders the success tone as a status region", () => {
    renderBanner(<SupporterSettingsBanner tone={"success"} />);

    const banner = screen.getByRole("status");
    expect(banner.getAttribute("data-testid")).toBe(
      "supporter-settings-banner-success",
    );
    expect(screen.getByText("supporter.checkout.success.title")).toBeTruthy();
    expect(
      screen.getByText("supporter.checkout.success.description"),
    ).toBeTruthy();
  });

  it("renders the cancel tone as a status region", () => {
    renderBanner(<SupporterSettingsBanner tone={"cancel"} />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByText("supporter.checkout.cancel.title")).toBeTruthy();
  });

  it("renders the error tone as an alert with the mapped message", () => {
    renderBanner(
      <SupporterSettingsBanner
        tone={"error"}
        description={"supporter.errors.billingUnavailable"}
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("data-testid")).toBe(
      "supporter-settings-banner-error",
    );
    expect(screen.getByText("supporter.banner.errorTitle")).toBeTruthy();
    expect(
      screen.getByText("supporter.errors.billingUnavailable"),
    ).toBeTruthy();
  });

  it("polls every 4s for at most 60s and then offers Check again", () => {
    vi.useFakeTimers();
    const onCheckAgain = vi.fn();

    renderBanner(
      <SupporterSettingsBanner tone={"pending"} onCheckAgain={onCheckAgain} />,
    );

    expect(screen.getByText("supporter.checkout.pending.title")).toBeTruthy();
    expect(onCheckAgain).not.toHaveBeenCalled();
    expect(
      screen.queryByText("supporter.checkout.pending.stillConfirming"),
    ).toBeNull();

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(onCheckAgain).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(4_000);
    });
    expect(onCheckAgain).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(
      screen.getByText("supporter.checkout.pending.stillConfirming"),
    ).toBeTruthy();

    const checkAgain = screen.getByRole("button", {
      name: "supporter.checkout.pending.refresh",
    });
    const callsAfterExpiry = onCheckAgain.mock.calls.length;

    // The bounded window is over: the interval stops calling on its own.
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(onCheckAgain).toHaveBeenCalledTimes(callsAfterExpiry);

    fireEvent.click(checkAgain);
    expect(onCheckAgain).toHaveBeenCalledTimes(callsAfterExpiry + 1);
  });

  it("keeps the manual Check again button disabled while checking", () => {
    vi.useFakeTimers();
    const onCheckAgain = vi.fn();

    const { rerender } = renderBanner(
      <SupporterSettingsBanner tone={"pending"} onCheckAgain={onCheckAgain} />,
    );

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    rerender(
      <MantineProvider>
        <SupporterSettingsBanner
          tone={"pending"}
          onCheckAgain={onCheckAgain}
          isChecking
        />
      </MantineProvider>,
    );

    const checkAgain = screen.getByRole("button", {
      name: "supporter.checkout.pending.refresh",
    }) as HTMLButtonElement;

    expect(checkAgain.disabled).toBe(true);
  });
});
