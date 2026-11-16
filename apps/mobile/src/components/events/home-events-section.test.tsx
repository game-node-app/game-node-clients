// @vitest-environment jsdom
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeEventsSection } from "../../../../../packages/ui/src/components/events/view/HomeEventsSection";
import type { SeasonEvents } from "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents";

const seasonState = vi.hoisted(() => ({
  value: null as unknown as SeasonEvents,
}));

vi.mock(
  "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents",
  () => ({ useSeasonEvents: () => seasonState.value }),
);

vi.mock(
  "../../../../../packages/ui/src/components/events/view/EventCard",
  () => ({
    EventCard: ({ kind, layout }: { kind: string; layout: string }) => (
      <div data-testid={`event-card-${kind}`} data-layout={layout} />
    ),
  }),
);

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "pt-BR", resolvedLanguage: "pt-BR" },
  }),
}));

function season(overrides: Partial<SeasonEvents> = {}): SeasonEvents {
  return {
    userId: "user-1",
    awardsEvent: null,
    awardsEntry: null,
    awardsBallot: undefined,
    awardsCategories: undefined,
    recapWindow: undefined,
    recapStatus: null,
    recapEntry: null,
    recapYear: null,
    recapHref: null,
    isLoading: false,
    ...overrides,
  };
}

function setViewport(isMobile: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: isMobile,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderSection() {
  return render(<HomeEventsSection />, {
    wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider>,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setViewport(false);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HomeEventsSection", () => {
  it("renders nothing when no event applies", () => {
    seasonState.value = season();

    renderSection();

    expect(screen.queryByTestId("home-events-section")).toBeNull();
  });

  it("uses the Wide layout for a single card", () => {
    seasonState.value = season({
      awardsEvent: { year: 2026 } as SeasonEvents["awardsEvent"],
      awardsEntry: {
        kind: "nominations",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/nominations",
      },
    });

    renderSection();

    expect(
      screen.getByTestId("home-events-section").getAttribute("data-layout"),
    ).toBe("wide");
    expect(
      screen
        .getByTestId("event-card-awards-nominations")
        .getAttribute("data-layout"),
    ).toBe("wide");
  });

  it("uses Half + Half with the Awards first for two cards", () => {
    seasonState.value = season({
      awardsEvent: { year: 2026 } as SeasonEvents["awardsEvent"],
      awardsEntry: {
        kind: "voting",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/vote",
      },
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
    });

    renderSection();

    expect(
      screen.getByTestId("home-events-section").getAttribute("data-layout"),
    ).toBe("duo");

    const cards = screen.getAllByTestId(/^event-card-/);
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute("data-testid")).toBe(
      "event-card-awards-voting",
    );
    expect(cards[1].getAttribute("data-testid")).toBe("event-card-recap-live");
    expect(cards[0].getAttribute("data-layout")).toBe("half");
    expect(cards[1].getAttribute("data-layout")).toBe("half");
  });

  it("renders one card for a visitor teaser alone", () => {
    seasonState.value = season({
      userId: undefined,
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: null,
    });

    renderSection();

    expect(
      screen.getByTestId("home-events-section").getAttribute("data-layout"),
    ).toBe("wide");
    expect(screen.getByTestId("event-card-recap-live")).toBeTruthy();
  });

  it("switches to the carousel below md", () => {
    setViewport(true);
    seasonState.value = season({
      awardsEvent: { year: 2026 } as SeasonEvents["awardsEvent"],
      awardsEntry: {
        kind: "voting",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/vote",
      },
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
    });

    renderSection();

    expect(
      screen.getByTestId("home-events-section").getAttribute("data-layout"),
    ).toBe("carousel");
    expect(screen.getAllByTestId(/^event-card-/)).toHaveLength(2);
    expect(
      screen.getAllByTestId(/^event-card-/)[0].getAttribute("data-layout"),
    ).toBe("mobile");
  });
});
