// @vitest-environment jsdom
import React from "react";
import { MantineProvider } from "@mantine/core";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileSidebarMenu } from "@/components/sidebar/MobileSidebarMenu";
import type { SeasonEvents } from "../../../../../packages/ui/src/components/events/hooks/useSeasonEvents";
import ptBR from "../../../../../packages/locales/src/translations/json/pt-BR.json";

const state = vi.hoisted(() => ({
  season: null as unknown as SeasonEvents,
  userId: "user-1" as string | undefined,
  recapVisited: false,
}));

vi.mock("@repo/ui", () => ({
  useUserId: () => state.userId,
  useSeasonEvents: () => state.season,
  useRecapVisited: () => state.recapVisited,
  signOut: vi.fn(async () => {}),
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(" "),
  UserButton: () => null,
  Link: ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("@ionic/react", () => ({
  IonContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  IonHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  IonRippleEffect: () => null,
}));

vi.mock("@ionic/core/components", () => ({
  menuController: { close: vi.fn(async () => {}) },
}));

function lookup(path: string): unknown {
  let value: unknown = ptBR;
  for (const part of path.split(".")) {
    value =
      typeof value === "object" && value !== null
        ? (value as Record<string, unknown>)[part]
        : undefined;
  }
  return value;
}

function translate(key: string, options?: Record<string, unknown>): string {
  const value = lookup(key);
  if (typeof value !== "string") return key;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    String(options?.[name] ?? ""),
  );
}

vi.mock("@repo/locales", () => ({
  useTranslation: () => ({
    t: translate,
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

function renderMenu() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <MantineProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <MobileSidebarMenu />
        </MemoryRouter>
      </QueryClientProvider>
    </MantineProvider>,
  );
}

function menuHref(label: string): string | null {
  return screen.getByText(label).closest("a")?.getAttribute("href") ?? null;
}

beforeEach(() => {
  vi.clearAllMocks();
  // `getTabAwareHref` reads `window.location`; single-process suite runs reuse
  // it, so this file declares the home tab it asserts against.
  window.history.replaceState({}, "", "/");
  state.userId = "user-1";
  state.recapVisited = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MobileSidebarMenu · seasonal entries", () => {
  it("shows Awards with the Ao vivo badge and the ballot destination during voting", () => {
    state.season = season({
      awardsEvent: { year: 2026 } as SeasonEvents["awardsEvent"],
      awardsEntry: {
        kind: "voting",
        showHomeCard: true,
        dockBadge: "live",
        href: "/awards/2026/vote",
      },
    });

    renderMenu();

    expect(screen.getByText("Awards 2026")).toBeTruthy();
    expect(screen.getByText("Ao vivo")).toBeTruthy();
    expect(menuHref("Awards 2026")).toBe("/home/awards/2026/vote");
    expect(screen.getByText("Wrapped")).toBeTruthy();
  });

  it("keeps the normal menu outside the season", () => {
    state.season = season();

    renderMenu();

    expect(screen.queryByText("Awards 2026")).toBeNull();
    expect(screen.queryByText("Ao vivo")).toBeNull();
    expect(screen.getByText("Wrapped")).toBeTruthy();
  });

  it("shows the personal Retrospectiva with the Nova badge next to Wrapped", () => {
    state.season = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
    });

    renderMenu();

    expect(screen.getByText("Wrapped")).toBeTruthy();
    expect(menuHref("Wrapped")).toBe("/home/wrapped");
    expect(screen.getByText("Novo")).toBeTruthy();
    expect(screen.getByText("Retrospectiva")).toBeTruthy();
    expect(screen.getByText("Nova")).toBeTruthy();
    expect(menuHref("Retrospectiva")).toBe("/home/recap/2026/user-1");
  });

  it("drops the Nova badge after the Retrospectiva was opened", () => {
    state.recapVisited = true;
    state.season = season({
      recapEntry: { kind: "live", year: 2026 },
      recapYear: 2026,
      recapHref: "/recap/2026/user-1",
    });

    renderMenu();

    expect(screen.getByText("Retrospectiva")).toBeTruthy();
    expect(screen.queryByText("Nova")).toBeNull();
  });

  it("shows the Awards result destination with the Novo badge", () => {
    state.season = season({
      awardsEvent: { year: 2026 } as SeasonEvents["awardsEvent"],
      awardsEntry: {
        kind: "results",
        showHomeCard: true,
        dockBadge: "new",
        href: "/awards/2026/result",
      },
    });

    renderMenu();

    // Wrapped carries its own "Novo" badge, next to the Awards one.
    expect(screen.getAllByText("Novo")).toHaveLength(2);
    expect(menuHref("Awards 2026")).toBe("/home/awards/2026/result");
  });
});
