// @vitest-environment jsdom
import { setupDom } from "@/components/mcp/testUtils";
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PreferencesSupporterItems from "./PreferencesSupporterItems";

const mocks = vi.hoisted(() => ({
  status: {} as Record<string, unknown>,
}));

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@repo/ui", () => ({
  useSupporterStatus: () => mocks.status,
}));

function renderItems() {
  return render(
    <MantineProvider>
      <PreferencesSupporterItems />
    </MantineProvider>,
  );
}

function supporterHref(container: HTMLElement) {
  const item = container.querySelector("ion-item") as
    | (HTMLElement & { href?: string })
    | null;

  return item?.href ?? item?.getAttribute("href");
}

beforeEach(() => {
  setupDom();
  window.history.replaceState({}, "", "/library");
  mocks.status = { data: { isSupporter: false } };
});

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("PreferencesSupporterItems", () => {
  it("shows the free prompt for a free user and links to the tab-aware route", () => {
    const { container } = renderItems();

    expect(
      screen.getAllByText("supporter.preferences.title").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("supporter.preferences.freeStatus")).toBeTruthy();
    expect(
      screen.queryByText("supporter.preferences.supporterStatus"),
    ).toBeNull();
    expect(supporterHref(container)).toBe("/library/preferences/supporter");
  });

  it("shows the supporter status line for a supporter", () => {
    mocks.status = {
      data: {
        isSupporter: true,
        status: "active",
        plan: "supporter",
        billingInterval: "month",
        periodEnd: "2026-12-01T00:00:00.000Z",
        cancelAtPeriodEnd: false,
        supporterSince: "2026-01-15T00:00:00.000Z",
      },
    };

    const { container } = renderItems();

    expect(
      screen.getByText("supporter.preferences.supporterStatus"),
    ).toBeTruthy();
    expect(screen.queryByText("supporter.preferences.freeStatus")).toBeNull();
    expect(supporterHref(container)).toBe("/library/preferences/supporter");
  });

  it("still renders the entry with the free prompt when the status query fails", () => {
    mocks.status = {
      data: undefined,
      isError: true,
      error: { code: 503 },
    };

    const { container } = renderItems();

    expect(
      screen.getAllByText("supporter.preferences.title").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("supporter.preferences.freeStatus")).toBeTruthy();
    expect(supporterHref(container)).toBe("/library/preferences/supporter");
  });

  it("tolerates a disabled or loading status query", () => {
    mocks.status = {
      data: undefined,
      isPending: true,
      isFetching: false,
      isSuccess: false,
    };

    const { container } = renderItems();

    expect(screen.getByText("supporter.preferences.freeStatus")).toBeTruthy();
    expect(supporterHref(container)).toBe("/library/preferences/supporter");
  });
});
